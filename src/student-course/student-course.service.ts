import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class StudentCourseService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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

    const existing = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId: data.courseId,
        },
      },
    });

    if (existing) throw new ConflictException('Already enrolled');

    try {
      // First, create the record
      const studentCourse = await this.prisma.studentCourse.create({ data });

      // Send email only after successful creation
      await this.mailService.sendCourseAssignedEmail(
        student.email,
        student.firstName,
        course.title,
      );

      return studentCourse;
    } catch (error) {
      console.error('Failed to assign course or send email', error);
      throw error; // rethrow if you want the API to return an error
    }
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
