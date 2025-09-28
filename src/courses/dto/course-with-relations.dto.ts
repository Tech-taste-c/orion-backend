import { ApiProperty } from '@nestjs/swagger';

export class StudentCourseDto {
  @ApiProperty() id: number;
  @ApiProperty() studentId: number;
  @ApiProperty() courseId: number;
  @ApiProperty() enrolledAt: Date;
  @ApiProperty() status: string;
}

export class StudentDto {
  @ApiProperty() id: number;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() status: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date | null;
}

export class StudentCourseWithStudentDto {
  @ApiProperty() id: number;
  @ApiProperty() studentId: number;
  @ApiProperty() courseId: number;
  @ApiProperty() enrolledAt: Date;
  @ApiProperty() status: string;
  @ApiProperty({ type: StudentDto }) student: StudentDto;
}

export class ExamDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() courseId: number;
  @ApiProperty() passMark: number;
  @ApiProperty() createdBy: number;
  @ApiProperty() duration: number;
  @ApiProperty() dateCreated: Date;
}

export class CertificateDto {
  @ApiProperty() id: number;
  @ApiProperty() certId: string;
  @ApiProperty() certName: string;
  @ApiProperty() courseId: number;
}

export class CourseWithRelationsDto {
  @ApiProperty() id: number;
  @ApiProperty() courseId: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() status: string;
  @ApiProperty() cost: number;
  @ApiProperty() duration: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [ExamDto] }) exams: ExamDto[];
  @ApiProperty({ type: [CertificateDto] }) certificates: CertificateDto[];
}
