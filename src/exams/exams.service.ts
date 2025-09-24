import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { TakeExamDto } from './dto/student-exam.dto';
import { CreateStudentExamAnswerDto } from './dto/create-student-exam-answer.dto';

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

  async getExamById(examId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                optionText: true,
              },
            },
          },
        },
      },
    });

    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async saveStudentExamAnswers(dto: CreateStudentExamAnswerDto) {
    const { studentExamId, answers } = dto;

    // Fetch StudentExam with related Exam and all questions + options
    const studentExam = await this.prisma.studentExam.findUnique({
      where: { id: studentExamId },
      include: {
        exam: {
          include: {
            questions: {
              include: { options: true }, // include all options at once
            },
          },
        },
      },
    });

    if (!studentExam) throw new NotFoundException('StudentExam not found');

    // Validate submission time
    const examStartTime = studentExam.takenAt;
    const examDurationHours = studentExam.exam.duration;
    const examEndTime = new Date(
      examStartTime.getTime() + examDurationHours * 60 * 60 * 1000,
    );

    if (new Date() > examEndTime) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Cannot submit exam: submission time is over.',
        submittedAt: new Date(),
        examEndTime: examEndTime,
      });
    }

    // Save all answers
    await this.prisma.studentExamAnswer.createMany({
      data: answers.map((a) => ({
        studentExamId,
        questionId: a.questionId,
        optionId: a.optionId,
      })),
    });

    // Calculate total score
    let totalScore = 0;
    for (const q of studentExam.exam.questions) {
      const studentAnswer = answers.find((a) => a.questionId === q.id);
      if (!studentAnswer) continue;

      const correctOption = q.options.find((o) => o.isCorrect);
      if (correctOption && correctOption.id === studentAnswer.optionId) {
        totalScore += q.marks;
      }
    }

    // Update StudentExam with calculated score
    return this.prisma.studentExam.update({
      where: { id: studentExamId },
      data: { score: totalScore },
    });
  }

  async getAllExamSubmissions() {
    const submissions = await this.prisma.studentExam.findMany({
      select: {
        id: true,
        score: true,
        takenAt: true,

        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },

        exam: {
          select: {
            name: true,
            passMark: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { takenAt: 'desc' },
    });
    return submissions.map((s) => ({
      ...s,
      takenAt: s.takenAt.toISOString().split('T')[0], // keep only the date part
    }));
  }

  async getExamSubmission(examSubId: number) {
    const submission = await this.prisma.studentExam.findUnique({
      // return this.prisma.studentExam.findUnique({
      where: { id: examSubId },
      include: {
        student: true, // Student who took the exam
        exam: {
          // Exam details
          include: {
            course: true, // Related course info
            questions: {
              include: {
                options: true, // Each question’s options
              },
            },
          },
        },
        studentExamAnswers: {
          // Answers submitted
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    if (!submission) throw new NotFoundException('Exam Submission not found');
    return submission;
  }
}
