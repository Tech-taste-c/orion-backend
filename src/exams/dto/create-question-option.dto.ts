import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateQuestionOptionDto {
  @ApiProperty({ example: '4' })
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}
