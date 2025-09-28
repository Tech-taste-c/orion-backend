import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ExamResponseDto } from './dto/exam-response.dto';
import { TakeExamDto } from './dto/student-exam.dto';
import { StartExamDto } from './dto/start-exam.dto';
import { CreateStudentExamAnswerDto } from './dto/create-student-exam-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Admin creates a new exam' })
  @ApiResponse({
    status: 201,
    description: 'Exam created',
    type: ExamResponseDto,
  })
  async createExam(@Body() dto: CreateExamDto) {
    return this.examsService.createExam(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exams' })
  @ApiResponse({
    status: 200,
    description: 'List of exams',
    type: [ExamResponseDto],
  })
  async getAllExams() {
    return this.examsService.getAllExams();
  }

  @Get('accessible')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get exams accessible to the logged-in student',
    description: 'Returns all exams from courses the student is enrolled in'
  })
  @ApiResponse({
    status: 200,
    description: 'List of accessible exams',
    type: [ExamResponseDto],
  })
  async getStudentAccessibleExams(@Request() req) {
    return this.examsService.getStudentAccessibleExams(req.user.id);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Student start an exam',
    description: 'Allows a student to start an exam. The student must be enrolled in the course that contains this exam.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Student exam recorded successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied - Student not enrolled in the course or enrollment status invalid' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Exam already taken by this student' 
  })
  async startExam(@Body() dto: StartExamDto, @Request() req) {
    return this.examsService.startExam(dto.examId, req.user.id);
  }

  @Get('student/:id')
  @ApiOperation({ summary: 'Get exams taken by a student' })
  @ApiResponse({ status: 200, description: 'List of student exams' })
  async getStudentExams(@Param('id', ParseIntPipe) studentId: number) {
    return this.examsService.getStudentExams(studentId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific exam with all questions and options',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam details including questions and options',
  })
  async getExam(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getExamById(id);
  }

  @Post('submit-answers')
  @ApiOperation({ summary: 'Save answers for an exam attempt' })
  @ApiResponse({ status: 201, description: 'Answers recorded' })
  async saveAnswers(@Body() dto: CreateStudentExamAnswerDto) {
    return this.examsService.saveStudentExamAnswers(dto);
  }

  @Get('submissions/all')
  @ApiOperation({ summary: 'List all exam submissions' })
  @ApiResponse({
    status: 200,
    description: 'Array of students exam submissions',
  })
  async getAllExamSubmissions() {
    return this.examsService.getAllExamSubmissions();
  }

  @Get('submissions/:id')
  @ApiOperation({
    summary: 'Details of an exam submission with questions, answers, and certificate information',
    description: 'Returns comprehensive details of an exam submission including student information, exam details, submitted answers, and one certificate (prioritizes student certificate, falls back to course certificate).'
  })
  @ApiResponse({
    status: 200,
    description: 'Details of a student exam submission including certificate information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        studentId: { type: 'number' },
        examId: { type: 'number' },
        score: { type: 'number' },
        takenAt: { type: 'string', format: 'date-time' },
        student: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' }
          }
        },
        exam: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            passMark: { type: 'number' },
            course: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' }
              }
            }
          }
        },
        certificate: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            issuedAt: { type: 'string', format: 'date-time' },
            score: { type: 'number' },
            certificate: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                certId: { type: 'string' },
                certName: { type: 'string' }
              }
            },
            admin: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        }
      }
    }
  })
  async getExamSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getExamSubmission(id);
  }

  @Get('course/:courseId/newest')
  @ApiOperation({ summary: 'Get the newest exam for a given course' })
  @ApiResponse({
    status: 200,
    description: 'The most recently created exam for the course',
  })
  async getNewestExamForCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.examsService.getNewestExamForCourse(courseId);
  }
}
