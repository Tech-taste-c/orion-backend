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
