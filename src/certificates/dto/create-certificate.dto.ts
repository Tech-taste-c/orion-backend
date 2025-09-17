import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ example: 'ORN-WDF-2024-001' })
  @IsString()
  @IsNotEmpty()
  certId: string;

  @ApiProperty({ example: 'Web Development Certificate' })
  @IsString()
  @IsNotEmpty()
  certName: string;

  @ApiProperty({ example: 1, description: 'Course ID' })
  @IsInt()
  courseId: number;
}
