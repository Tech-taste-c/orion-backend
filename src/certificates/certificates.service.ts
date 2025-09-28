import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { GrantCertificateDto } from './dto/grant-certificate.dto';

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
    // check student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // check certificate exists
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: data.certId },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');

    // check admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { id: data.issuedBy },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    // prevent duplicate
    const existing = await this.prisma.studentCertificate.findUnique({
      where: {
        studentId_certId: { studentId: data.studentId, certId: data.certId },
      },
    });
    if (existing)
      throw new ConflictException(
        'Certificate already granted to this student',
      );

    // Create the certificate record
    // Note: The score field is optional in the schema, so we'll include it if provided
    const createData: any = {
      studentId: data.studentId,
      certId: data.certId,
      issuedBy: data.issuedBy,
    };

    // Add score if it's provided and not null/undefined
    if (data.score !== undefined && data.score !== null) {
      createData.score = data.score;
    }

    return this.prisma.studentCertificate.create({ data: createData });
  }

  // Get all certificates for a student
  async getStudentCertificates(studentId: number) {
    return this.prisma.studentCertificate.findMany({
      where: { studentId },
      include: { certificate: true },
    });
  }
}
