import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { GrantCertificateDto } from './dto/grant-certificate.dto';
import { promises as fsp } from 'fs'; // for async readFile/writeFile
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { s3Client } from './s3.client';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  // Admin creates a certificate
  async createCertificate(data: CreateCertificateDto) {
    // check course exists
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.certificate.create({ data });
  }

  // Admin grants a certificate to a student
  async grantCertificate(data: GrantCertificateDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: data.certId },
      include: { course: true },
    });
    if (!student || !certificate) {
      throw new NotFoundException('Student or certificate not found');
    }

    // Prepare template variables
    const templatePath = path.join(
      process.cwd(),
      process.env.NODE_ENV === 'production'
        ? 'dist/templates'
        : 'src/templates',
      'certificate.hbs',
    );
    const htmlTemplate = await fsp.readFile(templatePath, { encoding: 'utf8' });
    const compile = handlebars.compile(htmlTemplate);

    const todayDate = new Date().toLocaleDateString();
    const html = compile({
      studentId: student.id,
      studentName: student.firstName,
      courseName: certificate.course.title,
      certificateName: certificate.certName,
      todayDate,
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Prepare S3 upload
    const fileName = `certificate_${student.id}_${Date.now()}.pdf`;
    const s3Key = `certificates/${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    const createData: any = {
      studentId: data.studentId,
      certId: data.certId,
      issuedBy: data.issuedBy,
      url: s3Key,
      score: data.score,
    };

    return this.prisma.studentCertificate.create({
      data: createData,
    });
  }

  // Get all certificates for a student
  async getStudentCertificates(studentId: number) {
    const records = await this.prisma.studentCertificate.findMany({
      where: { studentId },
      include: {
        certificate: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!records.length) {
      throw new NotFoundException('No certificates found for this student');
    }

    // Generate pre-signed URLs
    return Promise.all(
      records.map(async (record) => {
        let presignedUrl: string | null = null;

        if (record.url) {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: record.url,
          });
          presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300,
          }); // 5 min
        }

        return {
          id: record.id,
          issuedAt: record.issuedAt.toISOString().split('T')[0],
          certificate: {
            certId: record.certificate.certId,
            certName: record.certificate.certName,
            courseTitle: record.certificate.course.title,
          },
          issuedBy: record.issuedBy,
          url: presignedUrl,
        };
      }),
    );
  }
}
