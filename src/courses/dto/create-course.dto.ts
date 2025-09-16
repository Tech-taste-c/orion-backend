import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

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
}
