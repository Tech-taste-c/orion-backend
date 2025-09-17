import { Module } from '@nestjs/common';
import { StudentCourseService } from './student-course.service';
import { StudentCourseController } from './student-course.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StudentCourseController],
  providers: [StudentCourseService, PrismaService],
})
export class StudentCourseModule {}
