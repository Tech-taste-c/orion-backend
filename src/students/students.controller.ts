import { Controller, Post, Body } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

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
}
