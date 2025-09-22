import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateStudentStatusDto {
  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'suspended'] })
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'])
  status: string;
}
