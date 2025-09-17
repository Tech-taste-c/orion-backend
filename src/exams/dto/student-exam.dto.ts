import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TakeExamDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  examId: number;

  @ApiProperty({ example: 85, required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({ example: '2025-09-17T18:00:00Z', required: false })
  @IsOptional()
  takenAt?: Date;
}
