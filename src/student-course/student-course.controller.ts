import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { StudentCourseService } from './student-course.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { StudentCourseResponseDto } from './dto/student-course-response.dto';

@ApiTags('student-course')
@Controller('student-course')
export class StudentCourseController {
  constructor(private readonly service: StudentCourseService) {}

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll a student to a course' })
  @ApiResponse({
    status: 201,
    description: 'Enrollment created',
    type: StudentCourseResponseDto,
  })
  async enroll(@Body() dto: EnrollCourseDto) {
    return this.service.enroll(dto);
  }

  @Patch(':studentId/:courseId/complete')
  @ApiOperation({ summary: 'Mark a student’s course status as completed' })
  @ApiResponse({
    status: 200,
    description: 'Course status updated to completed',
    type: StudentCourseResponseDto,
  })
  async markCompleted(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<StudentCourseResponseDto> {
    return this.service.markCompleted(studentId, courseId);
  }

  /*   @Get()
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments',
    type: [StudentCourseResponseDto],
  })
  async findAll() {
    return this.service.findAll();
  } */
}
