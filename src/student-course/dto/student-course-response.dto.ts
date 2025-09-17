import { ApiProperty } from '@nestjs/swagger';

export class StudentCourseResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() studentId: number;
  @ApiProperty() courseId: number;
  @ApiProperty() enrolledAt: Date;
  @ApiProperty({ example: 'enrolled' }) status: string;
}
