import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class EnrollCourseDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ example: 2, description: 'Course ID' })
  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
