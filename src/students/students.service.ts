import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: hashed,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async login(data: LoginStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { email: data.email },
    });

    if (!student) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(data.password, student.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // For now just return student info (without password)
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
    };
  }

  async getEnrolledCourses(studentId: number) {
    // Ensure student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.studentCourse.findMany({
      where: { studentId },
      include: {
        course: true, // includes full course details
      },
    });
  }

  // Get all students with their enrolled courses and certificates
  async getAllStudents() {
    return this.prisma.student.findMany({
      include: {
        studentCourses: {
          include: {
            course: true, // brings full course details
          },
        },
        studentCertificates: {
          include: {
            certificate: true, // brings full certificate details
          },
        },
      },
    });
  }

  async updateStatus(id: number, dto: UpdateStudentStatusDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.student.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
