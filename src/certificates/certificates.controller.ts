import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
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

  // @ApiOperation({ summary: 'Get student certificate list' })
  // @ApiResponse({ status: 200, description: 'List of certificates returned' })
  // @Get('student/:id')
  // async getStudentCertificates(@Param('id') id: number) {
  //   return this.certificateService.getStudentCertificates(Number(id));
  // }

  @ApiOperation({
    summary: 'Public access to a shared certificate (PDF streaming)',
  })
  @ApiResponse({ status: 200, description: 'PDF streamed successfully' })
  @ApiResponse({ status: 404, description: 'Invalid or expired share link' })
  @Get('public/:shareId')
  async getPublicCertificate(
    @Param('shareId') shareId: string,
    @Res() res: Response,
  ) {
    const shared = await this.certificatesService.getSharedCertificate(shareId);
    if (!shared) throw new NotFoundException('Invalid share link');

    const key = shared.studentCertificate.url;

    if (!key) {
      throw new NotFoundException('Certificate URL missing');
    }
    const stream = await this.certificatesService.getCertificateStream(key);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="certificate.pdf"',
    });

    return stream.pipe(res);
  }
}
