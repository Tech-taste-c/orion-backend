import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { CreateExamQuestionDto } from './create-exam-question.dto';

export class CreateExamDto {
  @ApiProperty({ example: 'Midterm Exam' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Course ID' })
  @IsInt()
  courseId: number;

  @ApiProperty({ example: 70, description: 'Pass mark in %' })
  @IsNumber()
  passMark: number;

  @ApiProperty({ example: 1, description: 'Admin ID who created the exam' })
  @IsInt()
  createdBy: number;

  @ApiProperty({ example: 1.5, description: 'Duration in hours' })
  @IsNumber()
  duration: number;

  @ApiProperty({ type: [CreateExamQuestionDto], required: false })
  @IsOptional()
  @IsArray()
  questions?: CreateExamQuestionDto[];
}
