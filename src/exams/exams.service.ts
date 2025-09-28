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

  /**
   * Get all exams that a student has access to (based on their course enrollments)
   * @param studentId - The student's ID
   * @returns Promise<Exam[]> - List of accessible exams
   */
  async getStudentAccessibleExams(studentId: number) {
    // Get all courses the student is enrolled in
    const studentCourses = await this.prisma.studentCourse.findMany({
      where: {
        studentId: studentId,
        status: 'enrolled',
      },
      select: { courseId: true },
    });

    const courseIds = studentCourses.map(sc => sc.courseId);

    // Get all exams from those courses
    return this.prisma.exam.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
      include: {
        course: {
          select: {
            title: true,
            courseId: true,
          },
        },
      },
    });
  }

  /**
   * Check if a student has access to an exam
   * @param studentId - The student's ID
   * @param examId - The exam's ID
   * @returns Promise<boolean> - True if student has access, false otherwise
   */
  private async checkStudentExamAccess(studentId: number, examId: number): Promise<boolean> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { courseId: true },
    });

    if (!exam) return false;

    const studentCourse = await this.prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId,
          courseId: exam.courseId,
        },
      },
      select: { status: true },
    });

    return studentCourse?.status === 'enrolled';
  }

  async startExam(examId: number, studentId: number) {
    // Ensure student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Ensure exam exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    // Check if student has access to this exam
    const hasAccess = await this.checkStudentExamAccess(studentId, examId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this exam. Please enroll in the course first.',
      );
    }

    // Prevent duplicate take
    const existing = await this.prisma.studentExam.findUnique({
      where: {
        studentId_examId: { studentId, examId },
      },
    });
    if (existing) throw new ConflictException('Exam already taken');

    return this.prisma.studentExam.create({ 
      data: { 
        studentId, 
        examId,
        takenAt: new Date()
      } 
    });
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
      where: { id: examSubId },
      include: {
        student: {
          // Student who took the exam
          include: {
            studentCertificates: {
              // Student's certificates
              include: {
                certificate: true,
                admin: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        exam: {
          // Exam details
          include: {
            course: {
              // Related course info
              include: {
                certificates: true, // All certificates available for this course
              },
            },
            questions: {
              include: {
                options: true, // Each question's options
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
    
    // Transform the response to return only one certificate (prioritize student certificate)
    const studentCertificate = submission.student.studentCertificates.length > 0 
      ? submission.student.studentCertificates[0] 
      : null;
    
    const courseCertificate = submission.exam.course.certificates.length > 0 
      ? submission.exam.course.certificates[0] 
      : null;

    // Use student certificate if available, otherwise use course certificate
    const certificate = studentCertificate || courseCertificate;

    const transformedSubmission = {
      ...submission,
      student: {
        ...submission.student,
        // Remove studentCertificates from response
      },
      exam: {
        ...submission.exam,
        course: {
          ...submission.exam.course,
          // Remove certificates from response
        },
      },
      certificate: certificate,
    };

    return transformedSubmission;
  }

  /**
   * Get certificate details for a specific exam submission
   * @param examSubId - The exam submission ID
   * @returns Promise<object> - Certificate details for the submission (first certificate only)
   */
  async getExamSubmissionCertificates(examSubId: number) {
    const submission = await this.prisma.studentExam.findUnique({
      where: { id: examSubId },
      select: {
        id: true,
        studentId: true,
        examId: true,
        score: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCertificates: {
              include: {
                certificate: true,
                admin: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        exam: {
          select: {
            course: {
              select: {
                certificates: true,
              },
            },
          },
        },
      },
    });

    if (!submission) throw new NotFoundException('Exam Submission not found');
    
    // Transform to return only one certificate (prioritize student certificate)
    const studentCertificate = submission.student.studentCertificates.length > 0 
      ? submission.student.studentCertificates[0] 
      : null;
    
    const courseCertificate = submission.exam.course.certificates.length > 0 
      ? submission.exam.course.certificates[0] 
      : null;

    // Use student certificate if available, otherwise use course certificate
    const certificate = studentCertificate || courseCertificate;

    const transformedSubmission = {
      ...submission,
      student: {
        ...submission.student,
        // Remove studentCertificates from response
      },
      exam: {
        ...submission.exam,
        course: {
          ...submission.exam.course,
          // Remove certificates from response
        },
      },
      certificate: certificate,
    };

    return transformedSubmission;
  }

  async getNewestExamForCourse(courseId: number) {
    const exam = await this.prisma.exam.findFirst({
      where: { courseId },
      orderBy: { dateCreated: 'desc' }, // newest first
    });

    if (!exam) {
      throw new NotFoundException(`No exam found for course ${courseId}`);
    }

    return exam;
  }
}
