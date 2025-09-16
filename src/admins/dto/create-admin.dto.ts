import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Plain text password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Role of the admin (e.g., super, editor)' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
