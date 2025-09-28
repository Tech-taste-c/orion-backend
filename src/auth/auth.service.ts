import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StudentsService } from '../students/students.service';
import { AdminsService } from '../admins/admins.service';
import { LoginStudentDto } from '../students/dto/login-student.dto';
import { LoginAdminDto } from '../admins/dto/login-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private studentsService: StudentsService,
    private adminsService: AdminsService,
  ) {}

  async validateStudent(email: string, password: string): Promise<any> {
    const student = await this.studentsService.findByEmail(email);
    if (student && await this.studentsService.validatePassword(password, student.password)) {
      const { password, ...result } = student;
      return result;
    }
    return null;
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminsService.findByEmail(email);
    if (admin && await this.adminsService.validatePassword(password, admin.password)) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async loginStudent(loginDto: LoginStudentDto) {
    const student = await this.validateStudent(loginDto.email, loginDto.password);
    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { 
      email: student.email, 
      sub: student.id, 
      type: 'student',
      firstName: student.firstName,
      lastName: student.lastName
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        type: 'student'
      }
    };
  }

  async loginAdmin(loginDto: LoginAdminDto) {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { 
      email: admin.email, 
      sub: admin.id, 
      type: 'admin',
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      }
    };
  }
}
