import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { GrantCertificateDto } from './dto/grant-certificate.dto';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @ApiOperation({ summary: 'Admin creates a certificate' })
  @ApiResponse({ status: 201, description: 'Certificate created' })
  async createCertificate(@Body() dto: CreateCertificateDto) {
    return this.certificatesService.createCertificate(dto);
  }

  @Post('grant')
  @ApiOperation({ summary: 'Admin grants a certificate to a student' })
  @ApiResponse({ status: 201, description: 'Certificate granted' })
  async grantCertificate(@Body() dto: GrantCertificateDto) {
    return this.certificatesService.grantCertificate(dto);
  }

  @Get('student/:id')
  @ApiOperation({ summary: 'Get all certificates for a student' })
  @ApiResponse({ status: 200, description: 'List of student certificates' })
  async getStudentCertificates(@Param('id', ParseIntPipe) studentId: number) {
    return this.certificatesService.getStudentCertificates(studentId);
  }
}
