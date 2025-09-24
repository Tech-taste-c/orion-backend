import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  // Sign up
  async create(data: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.admin.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashed,
        role: data.role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Sign in
  async login(data: LoginAdminDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: data.email },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(data.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    };
  }

  async getDashboardStats() {
    // total students
    const totalStudents = await this.prisma.student.count();

    // active courses
    const activeCourses = await this.prisma.course.count({
      where: { status: 'active' },
    });

    // completion rate = completed enrollments / total enrollments * 100
    const [completed, totalEnrollments] = await Promise.all([
      this.prisma.studentCourse.count({ where: { status: 'completed' } }),
      this.prisma.studentCourse.count(),
    ]);

    const completionRate =
      totalEnrollments === 0
        ? 0
        : Number(((completed / totalEnrollments) * 100).toFixed(2));

    return {
      totalStudents,
      activeCourses,
      completionRate, // percentage
    };
  }
}
