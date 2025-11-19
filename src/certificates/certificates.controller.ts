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
import { escape } from 'he';

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

  @Get('share/:shareId')
  @ApiOperation({ summary: 'Get HTML view of the certificate with metadata' })
  @ApiResponse({ status: 200, description: 'HTML view of the certificate' })
  async shareCertificate(
    @Param('shareId') shareId: string,
    @Res() res: Response,
  ) {
    const API_BASE_URL = 'https://lms-api.orion-technical.com';

    const viewerUrl = `https://lms.orion-technical.com/certificates/public/${shareId}`;

    let cert: any = null;
    try {
      cert =
        await this.certificatesService.getPublicCertificateMetadata(shareId);
    } catch (e) {
      // if it fails, we'll fall back to defaults
    }

    const title = cert
      ? `${cert.certificate.certName} Certificate`
      : 'Course Certificate';

    const description = cert
      ? `I just completed the ${cert.certificate.certName} course with a score of ${cert.score}%.`
      : 'I just completed a course certification.';

    // IMPORTANT: this should be a public PNG/JPG of the certificate (on S3/CloudFront)
    // e.g. generated at issue time: certificates/previews/:shareId.png
    const image =
      'https://cert-public-assets.s3.us-east-2.amazonaws.com/cert.png';

    // The URL that appears in LinkedIn (the one we're on now)
    const shareUrl = `${API_BASE_URL}/certificates/share/${shareId}`;

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escape(title)}</title>

      <!-- Open Graph -->
      <meta property="og:title" content="${escape(title)}" />
      <meta property="og:description" content="${escape(description)}" />
      <meta property="og:image" content="${escape(image)}" />
      <meta property="og:url" content="${escape(shareUrl)}" />
      <meta property="og:type" content="website" />

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${escape(title)}" />
      <meta name="twitter:description" content="${escape(description)}" />
      <meta name="twitter:image" content="${escape(image)}" />

      <!-- Redirect users to your frontend viewer -->
      <meta http-equiv="refresh" content="0;url=${escape(viewerUrl)}" />
      <script>
        window.location.replace(${JSON.stringify(viewerUrl)});
      </script>
    </head>
    <body>
      <p>Redirecting to certificate...</p>
      <a href="${escape(viewerUrl)}">Click here if not redirected.</a>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

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
