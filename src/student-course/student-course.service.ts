import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';

@Injectable()
export class StudentCourseService {
  constructor(private prisma: PrismaService) {}

  async enroll(data: EnrollCourseDto) {
    // ensure student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // ensure course exists
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // check duplicate
    const existing = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId: data.courseId,
        },
      },
    });
    if (existing) throw new ConflictException('Already enrolled');

    return this.prisma.studentCourse.create({ data });
  }

  async findAll() {
    return this.prisma.studentCourse.findMany({
      include: { student: true, course: true },
    });
  }

  async markCompleted(studentId: number, courseId: number) {
    // check that enrollment exists
    const enrollment = await this.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.studentCourse.update({
      where: { studentId_courseId: { studentId, courseId } },
      data: { status: 'completed' },
    });
  }
}
