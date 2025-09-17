import { ApiProperty } from '@nestjs/swagger';

export class ExamResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() courseId: number;
  @ApiProperty() passMark: number;
  @ApiProperty() createdBy: number;
  @ApiProperty() duration: number;
  @ApiProperty() dateCreated: Date;
}
