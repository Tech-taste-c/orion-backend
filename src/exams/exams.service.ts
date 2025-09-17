import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { TakeExamDto } from './dto/student-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async createExam(data: CreateExamDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const admin = await this.prisma.admin.findUnique({
      where: { id: data.createdBy },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    // Create exam + questions + options in one transaction
    const exam = await this.prisma.exam.create({
      data: {
        name: data.name,
        courseId: data.courseId,
        passMark: data.passMark,
        createdBy: data.createdBy,
        duration: data.duration,
        questions: data.questions
          ? {
              create: data.questions.map((q) => ({
                questionText: q.questionText,
                marks: q.marks,
                options: {
                  create: q.options,
                },
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return exam;
  }

  async getAllExams() {
    return this.prisma.exam.findMany();
  }

  async takeExam(dto: TakeExamDto) {
    // Ensure student exists
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Ensure exam exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    // Prevent duplicate take
    const existing = await this.prisma.studentExam.findUnique({
      where: {
        studentId_examId: { studentId: dto.studentId, examId: dto.examId },
      },
    });
    if (existing) throw new ConflictException('Exam already taken');

    return this.prisma.studentExam.create({ data: dto });
  }

  async getStudentExams(studentId: number) {
    return this.prisma.studentExam.findMany({
      where: { studentId },
      include: { exam: true },
    });
  }
}
