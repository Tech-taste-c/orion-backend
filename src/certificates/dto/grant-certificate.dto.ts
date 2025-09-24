import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class GrantCertificateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  certId: number;

  @ApiProperty({ example: 1, description: 'Admin ID granting the certificate' })
  @IsInt()
  issuedBy: number;

  @ApiProperty({ example: 70, description: 'Score' })
  @IsNumber()
  score: number;
}
