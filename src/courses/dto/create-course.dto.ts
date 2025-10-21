import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'JS001' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'Intro to JavaScript' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn the basics of JS programming' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'active', description: 'Status of the course' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 99.99, description: 'Cost in dollars' })
  @IsNumber()
  cost: number;

  @ApiProperty({ example: 3.5, description: 'Duration in hours (e.g. 3.5)' })
  @IsNumber()
  duration: number;

  @ApiProperty({
    required: false,
    example: 'https://example.com/course/intro-to-electronics',
  })
  @IsOptional()
  @IsUrl()
  courseDetailPageLink?: string;
}
