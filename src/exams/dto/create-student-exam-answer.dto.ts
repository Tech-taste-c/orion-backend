import { IsInt, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  questionId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  optionId: number;
}

export class CreateStudentExamAnswerDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  studentExamId: number;

  @ApiProperty({
    type: [AnswerDto],
    example: [
      { questionId: 1, optionId: 2 },
      { questionId: 2, optionId: 4 },
    ],
  })
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
