import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { MailService } from './mail.service';

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are not configured properly');
}

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        SES: {
          sesClient: new SESv2Client({
            region: AWS_REGION,
            credentials: {
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
          }),
          SendEmailCommand: SendEmailCommand,
        },
      },
      defaults: {
        from: '"Orion LMS" <no-reply@orion-technical.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
