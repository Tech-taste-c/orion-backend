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
import QRCode from 'qrcode';
import { s3Client } from './s3.client';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs/promises';
import fontkit from '@pdf-lib/fontkit';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
    // 🔹 Load your PDF template
    // const templatePath = path.join(
    //   process.cwd(),
    //   process.env.NODE_ENV === 'production'
    //     ? 'dist/templates'
    //     : 'src/templates',
    //   'cert.pdf',
    // );
    const templatePath = path.join(process.cwd(), 'dist/templates/cert.pdf');
    const existingPdfBytes = await fs.readFile(templatePath);

    // 🔹 Load and prepare the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // const helveticaBoldFont = await pdfDoc.embedFont(
    //   StandardFonts.HelveticaBold,
    // );
    // const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    // const helveticaBoldItFont = await pdfDoc.embedFont(
    //   StandardFonts.HelveticaBoldOblique,
    // );
    pdfDoc.registerFontkit(fontkit);
    // const fontPath = path.join(
    //   process.cwd(),
    //   process.env.NODE_ENV === 'production'
    //     ? 'dist/assets/fonts'
    //     : 'src/assets/fonts',
    //   'Montserrat-SemiBold.ttf',
    // );
    const fontPath = path.join(
      process.cwd(),
      'dist/assets/fonts/Montserrat-SemiBold.ttf',
    );
    const fontBytes = await fsp.readFile(fontPath);
    const montserratFont = await pdfDoc.embedFont(fontBytes);
    const fontPathBold = path.join(
      process.cwd(),
      'dist/assets/fonts/Montserrat-ExtraBold.ttf',
    );
    const fontBytesBold = await fsp.readFile(fontPathBold);
    const montserratFontBold = await pdfDoc.embedFont(fontBytesBold);
    const fontPathBoldItalic = path.join(
      process.cwd(),
      'dist/assets/fonts/Montserrat-SemiBoldItalic.ttf',
    );
    const fontBytesBoldItalic = await fsp.readFile(fontPathBoldItalic);
    const montserratFontBoldItalic =
      await pdfDoc.embedFont(fontBytesBoldItalic);

    const textColor = rgb(0, 0, 0);

    // 🔹 Prepare data
    const today = new Date();
    const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
    const qrDataURL = await QRCode.toDataURL(
      certificate.course.courseDetailPageLink ||
        'https://orion-technical.com/courses/',
    );
    const centerX = 5.5 * 72;
    const fullName = `${student.firstName} ${student.lastName}`;
    const textWidthName = montserratFontBold.widthOfTextAtSize(fullName, 24);
    page.drawText(fullName.toUpperCase(), {
      x: centerX - textWidthName / 2,
      y: 4 * 72,
      size: 24,
      font: montserratFontBold,
      color: textColor,
    });

    page.drawText(String(certificate.course.duration), {
      x: 4.47 * 72,
      y: 3.5 * 72,
      size: 13,
      font: montserratFont,
      color: textColor,
    });

    const textWidthTitle = montserratFontBoldItalic.widthOfTextAtSize(
      certificate.course.title.trim(),
      22,
    );
    page.drawText(certificate.course.title, {
      x: centerX - textWidthTitle / 2,
      y: 2.7 * 72,
      size: 22,
      font: montserratFontBoldItalic,
      color: textColor,
    });

    page.drawText(todayDate, {
      x: 4.3 * 72,
      y: 1 * 72,
      size: 14,
      font: montserratFont,
      color: textColor,
    });

    page.drawText(student.id.toString(), {
      x: 5.1 * 72,
      y: 0.3 * 72,
      size: 12,
      font: montserratFont,
      color: textColor,
    });

    // Embed QR Code (as image)
    const qrImageBytes = Buffer.from(
      qrDataURL.replace(/^data:image\/png;base64,/, ''),
      'base64',
    );
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrDims = qrImage.scale(0.5); // adjust scaling later

    page.drawImage(qrImage, {
      x: 1.2 * 72,
      y: 0.75 * 72,
      width: qrDims.width,
      height: qrDims.height,
    });

    // Save modified PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Upload to S3
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

    // Save record in DB
    const createData: any = {
      studentId: data.studentId,
      certId: data.certId,
      issuedBy: data.issuedBy,
      url: s3Key,
      score: data.score,
    };

    try {
      const studentCertificate = await this.prisma.studentCertificate.create({
        data: createData,
      });

      // Create the permanent share link immediately
      await this.prisma.certificateShare.create({
        data: {
          studentCertificateId: studentCertificate.id,
          shareId: randomBytes(32).toString('hex'),
        },
      });

      await this.mailService.sendCertificateReadyEmail(
        student.email,
        student.firstName,
        certificate.course.title,
      );

      return studentCertificate;
    } catch (error) {
      // Log the error or handle it
      console.error('Failed to create certificate or send email', error);
      throw error; // rethrow if you want the API to return an error
    }
  }

  // Get all certificates for a student
  // async getStudentCertificates(studentId: number) {
  //   const records = await this.prisma.studentCertificate.findMany({
  //     where: { studentId },
  //     include: {
  //       certificate: {
  //         include: {
  //           course: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!records.length) {
  //     throw new NotFoundException('No certificates found for this student');
  //   }

  //   // Generate pre-signed URLs
  //   return Promise.all(
  //     records.map(async (record) => {
  //       let presignedUrl: string | null = null;

  //       if (record.url) {
  //         const command = new GetObjectCommand({
  //           Bucket: process.env.S3_BUCKET_NAME!,
  //           Key: record.url,
  //         });
  //         presignedUrl = await getSignedUrl(s3Client, command, {
  //           expiresIn: 300,
  //         }); // 5 min
  //       }

  //       return {
  //         id: record.id,
  //         issuedAt: record.issuedAt.toISOString().split('T')[0],
  //         score: record.score,
  //         certificate: {
  //           certId: record.certificate.certId,
  //           certName: record.certificate.certName,
  //           courseTitle: record.certificate.course.title,
  //         },
  //         issuedBy: record.issuedBy,
  //         url: presignedUrl,
  //       };
  //     }),
  //   );
  // }

  async getSharedCertificate(shareId: string) {
    return this.prisma.certificateShare.findUnique({
      where: { shareId },
      include: {
        studentCertificate: true,
      },
    });
  }

  async getCertificateStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const result = await s3Client.send(command);
    return result.Body as Readable;
  }

  async getStudentCertificates(studentId: number) {
    const records = await this.prisma.studentCertificate.findMany({
      where: { studentId },
      include: {
        certificate: { include: { course: true } },
        share: true,
      },
    });

    if (!records.length)
      throw new NotFoundException('No certificates found for this student');

    return Promise.all(
      records.map(async (record) => {
        let presignedUrl: string | null = null;

        if (record.url) {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: record.url,
          });

          presignedUrl = (await getSignedUrl(s3Client, command, {
            expiresIn: 300, // 5 mins
          })) as string;
        }

        return {
          id: record.id,
          issuedAt: record.issuedAt.toISOString().split('T')[0],
          score: record.score,
          certificate: {
            certId: record.certificate.certId,
            certName: record.certificate.certName,
            courseTitle: record.certificate.course.title,
          },
          issuedBy: record.issuedBy,
          url: presignedUrl,
          shareId: record.share?.shareId || null,
        };
      }),
    );
  }
}
