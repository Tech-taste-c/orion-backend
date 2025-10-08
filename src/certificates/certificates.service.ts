import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { GrantCertificateDto } from './dto/grant-certificate.dto';
import * as fs from 'fs'; // for existsSync / mkdirSync
import { promises as fsp } from 'fs'; // for async readFile/writeFile
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

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
    // Inside the function
    const certificatesDir =
      process.env.CERTIFICATES_DIR || 'public/certificates';
    const certificatesBaseUrl =
      process.env.CERTIFICATES_BASE_URL ||
      'https://your-domain.com/certificates';
    // Fetch data
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

    // Generate PDF file with puppeteer
    const outputDir = path.join(process.cwd(), certificatesDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `certificate_${student.id}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    // Construct public URL (assuming /public is served as static)
    const publicUrl = `${certificatesBaseUrl}/${fileName}`;

    const createData: any = {
      studentId: data.studentId,
      certId: data.certId,
      issuedBy: data.issuedBy,
      url: publicUrl,
      score: data.score,
    };

    return this.prisma.studentCertificate.create({ data: createData });
  }

  // Get all certificates for a student
  async getStudentCertificates(studentId: number) {
    const certs = await this.prisma.studentCertificate.findMany({
      where: { studentId },
      include: {
        certificate: true,
      },
    });

    // Append a static URL for each record
    return certs.map((c) => ({
      ...c,
      url: 'https://orion-lms-student-portal.s3.ap-southeast-1.amazonaws.com/certificate05.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUDFZYZHPYB5SIPIK%2F20250929%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20250929T170000Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFEaDmFwLXNvdXRoZWFzdC0xIkgwRgIhANICU0CMOehiFRgmWd8aQuyh5MGICr8C6vlYB05ngTd9AiEA8kUDgEQ0O0cRWKB7clg9E8JM6Jm96c7vtuo1eGAEytIqgAMI2v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwyODE3MDk5NTU1NTEiDBlj4O8CgwCno%2FZ9hCrUAkin6ATWimW8AfvHOSkAhnHLcogwgWukrKzZYScXjxgAsvDoEFXweQaFuajCLrHGBqiAlY%2Fug5Ijw5zQUhQBXdMcSdl5jxVyuE82blRqO2DFyURjbmMcXf3vqKL8ZAtqYu76LRu1slZJTPRD9zjaWIyNzGHbjG%2FSPpfuaC0%2B60mm2bELkdgaVlDnanR3qJ5E6TFAnzArhu9hOFx0zGUv5ZKvbrr31dAI26azLWbaHH4BHsU3zTUCggk0rNdJvmPh3jmKvIVQx0PySNi6DCGx4LTCL%2FDWfgyhvlFsHD1YAPD3IpjwW%2BaFvx%2BQeNDdMP5%2Br6t7r9rGOJf4eqkRUwd2sq4MKMXoEEVm3zptYmB%2BadPCZQCAk7j2uBYTvGpBnvbyvp5OuynUj96Xu5Qaao%2FXBXWdkgkf8BvLeesNT%2BhQY0n%2Bx0EU6xyP4fVCQN4F2%2Bjsa8o9h7owjvXqxgY6rAIacK0ixD20PzYgT0n0qDzPhNp0%2BLmCd7X%2BNa7%2BOPU9%2BQjFvvcpki2i7DRiM%2FZ8rQeh%2FcHsdNYBvG6ZIilbjCvMB8eRhsEZmxnPi64xniNmGY0iSCd%2BIsUjPdOnUxneOcsB4zWYyjKlvYv2Qwf4f0INsVMsBFNdyWT79bSEuGtxwGcMSccS37vURxtQWKU6r38zADHITZG9ztxcBCA1lFznegS43YOC%2FFA5MDBvrdnaDRMuKKe2KJKl6jaPdjCRqWs6ZrSpcRyoQ5Q0uxJ3JpGEcKqJWOYnqDTp%2FkcBkvWErm%2BcQ4YhrJwjcys5xZryX72sjYP8RmmlKl1Lc0dpj2QfNGfxZC%2FEO2pYRA95ygsvmjeZYZkYhja441Gy2lyL85tpyYsThTcX8HCVVfQ%3D&X-Amz-Signature=a077cc16967083cf98c805501184d117b81d8674d57231867949565f1bd52a1c&X-Amz-SignedHeaders=host&response-content-disposition=inline', // fixed placeholder until certificate generation is completed
    }));
  }
}
