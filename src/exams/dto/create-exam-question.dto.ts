import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';
import { CreateQuestionOptionDto } from './create-question-option.dto';

export class CreateExamQuestionDto {
  @ApiProperty({ example: 'What is 2+2?' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  marks: number;

  @ApiProperty({ type: [CreateQuestionOptionDto] })
  @IsArray()
  options: CreateQuestionOptionDto[];
}
