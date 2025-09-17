import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EnrolledCourseResponseDto } from './dto/enrolled-course-response.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: 'Student successfully registered' })
  async signup(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Post('login')
  @ApiOkResponse({ description: 'Student successfully logged in' })
  async login(@Body() dto: LoginStudentDto) {
    return this.studentsService.login(dto);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get all courses a student has enrolled in' })
  @ApiResponse({
    status: 200,
    description: 'List of enrolled courses',
    type: [EnrolledCourseResponseDto],
  })
  async getEnrolledCourses(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EnrolledCourseResponseDto[]> {
    const enrollments = await this.studentsService.getEnrolledCourses(id);

    // Map to DTO shape
    return enrollments.map((e) => ({
      id: e.courseId,
      courseId: e.course.courseId,
      title: e.course.title,
      description: e.course.description,
      duration: e.course.duration,
      status: e.course.status,
      cost: e.course.cost,
      enrolledAt: e.enrolledAt,
    }));
  }
}
