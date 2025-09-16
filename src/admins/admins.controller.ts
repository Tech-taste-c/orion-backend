import { Controller, Post, Body } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

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
}
