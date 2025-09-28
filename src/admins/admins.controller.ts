import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('signup')
  @ApiCreatedResponse({ description: 'Admin successfully registered' })
  async signup(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Post('signin')
  @ApiOkResponse({ description: 'Admin successfully signed in' })
  async signin(@Body() dto: LoginAdminDto) {
    return this.adminsService.login(dto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  @ApiResponse({
    status: 200,
    description: 'Total students, active courses, and completion rate',
  })
  async getDashboardStats() {
    return this.adminsService.getDashboardStats();
  }
}
