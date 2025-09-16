import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCourseDto): Promise<Course> {
    return this.prisma.course.create({ data });
  }

  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }

  async update(id: number, data: UpdateCourseDto): Promise<Course> {
    const exists = await this.prisma.course.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Course ${id} not found`);
    return this.prisma.course.update({ where: { id }, data });
  }

  async remove(id: number): Promise<{ message: string }> {
    const exists = await this.prisma.course.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Course ${id} not found`);
    await this.prisma.course.delete({ where: { id } });
    return { message: `Course ${id} deleted successfully` };
  }
}
