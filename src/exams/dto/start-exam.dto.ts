import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class StartExamDto {
  @ApiProperty({ example: 2, description: 'The ID of the exam to start' })
  @IsInt()
  @IsNotEmpty()
  examId: number;
}
