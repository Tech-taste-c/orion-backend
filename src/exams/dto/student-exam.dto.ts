import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class TakeExamDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  examId: number;
}
