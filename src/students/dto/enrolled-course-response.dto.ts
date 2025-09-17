import { ApiProperty } from '@nestjs/swagger';

export class EnrolledCourseResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() courseId: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() duration: number;
  @ApiProperty() status: string;
  @ApiProperty() cost: number;
  @ApiProperty() enrolledAt: Date;
}
