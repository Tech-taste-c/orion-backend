import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() status: string;
  @ApiProperty() cost: number;
  @ApiProperty() createdAt: Date;
}
