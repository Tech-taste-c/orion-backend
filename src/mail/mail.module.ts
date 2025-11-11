import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import * as AWS from 'aws-sdk';
import { MailService } from './mail.service';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        ses: new AWS.SES({ apiVersion: '2010-12-01' }),
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
