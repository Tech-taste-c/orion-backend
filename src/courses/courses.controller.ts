import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseWithRelationsDto } from './dto/course-with-relations.dto';
import { Course } from '@prisma/client';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'List of courses',
    type: CourseResponseDto,
    isArray: true,
  })
  async getCourses(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID with exams and certificates' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Course with associated exams and certificates',
    type: CourseWithRelationsDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseWithRelationsDto> {
    return this.coursesService.findOneWithRelations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Course courseId already exists' })
  async createCourse(@Body() body: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing course (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course courseId already exists' })
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.coursesService.remove(id);
  }
}
