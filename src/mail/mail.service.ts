import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, firstName: string) {
    try {
      const companyName = 'Orion Technical';
      const portalLink = 'https://lms.orion-technical.com';
      const supportPhone = '(208) 715-1590';

      await this.mailerService.sendMail({
        to,
        subject: `Welcome to ${companyName}!`,
        text: `Hi ${firstName},

  Thank you for signing up with ${companyName}! We’re excited to have you on board.

  You now have access to our client portal where you can easily access your certifications, track progress on exams, and stay connected with our team using the credentials you’ve signed up with.

  Access Your Portal: ${portalLink}
  Need Help? Contact us anytime at ${supportPhone}

  We’re committed to delivering precise technical solutions and outstanding support. If you have any questions or need guidance getting started, don’t hesitate to reach out.

  Welcome again,
  The ${companyName} Team`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h3>Hi ${firstName},</h3>
            <p>Thank you for signing up with <strong>${companyName}</strong>! We’re excited to have you on board.</p>
            
            <p>
              You now have access to our client portal where you can easily access your certifications, 
              track progress on exams, and stay connected with our team using the credentials you’ve signed up with.
            </p>

            <p style="margin-top: 20px;">
              🔗 <strong><a href="${portalLink}" style="color: #007BFF; text-decoration: none;">Access Your Portal</a></strong><br>
              📞 <strong>Need Help?</strong> Contact us anytime at <a href="tel:${supportPhone}" style="color: #007BFF;">${supportPhone}</a>
            </p>

            <p>
              We’re committed to delivering precise technical solutions and outstanding support. 
              If you have any questions or need guidance getting started, don’t hesitate to reach out.
            </p>

            <p>Welcome again,<br>
            The <strong>${companyName}</strong> Team</p>
          </div>
        `,
      });

      console.log(`✅ Welcome email sent to ${to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  async sendCourseAssignedEmail(
    to: string,
    firstName: string,
    courseName: string,
  ) {
    try {
      const companyName = 'Orion Technical';
      const portalLink = 'https://lms.orion-technical.com';

      await this.mailerService.sendMail({
        to,
        subject: `New Course Assigned – Action Required`,
        text: `Hi ${firstName},

  You've been assigned a new ${courseName} on the Orion Technical Learning Portal.

  Access It Here: ${portalLink}

  Please log in to your account to begin the course or exam at your earliest convenience. If you have any questions or encounter any issues, please feel free to reach out to your instructor at mike@orion-technical.com.

  Good luck and enjoy your learning journey!
  The ${companyName} Team`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h3>Hi ${firstName},</h3>
            <p>You've been assigned a new ${courseName} on the Orion Technical Learning Portal.</p>

            <p style="margin-top: 20px;">
              🔗 <strong><a href="${portalLink}" style="color: #007BFF; text-decoration: none;">Access Your Portal</a></strong>
            </p>

            <p>
              Please log in to your account to begin the course or exam at your earliest convenience. If you have any questions or encounter any issues, please feel free to reach out to your instructor at mike@orion-technical.com.
            </p>

            <p>Good luck and enjoy your learning journey!<br>
            The <strong>${companyName}</strong> Team</p>
          </div>
        `,
      });

      console.log(`✅ Course assigning email sent to ${to}`);
    } catch (error) {
      console.error('❌ Error sending course assigning email:', error);
    }
  }

  async sendCertificateReadyEmail(
    to: string,
    firstName: string,
    courseName: string,
  ) {
    try {
      const companyName = 'Orion Technical';
      const portalLink = 'https://lms.orion-technical.com';
      const supportPhone = '(208) 715-1590';

      await this.mailerService.sendMail({
        to,
        subject: `Welcome to ${companyName}!`,
        text: `Congratulations ${firstName},

  You have successfully passed the ${courseName} exam and are now available at the Orion Technical Learning Portal.

  You now have access to our client portal where you can easily access your certifications, track progress on exams, and stay connected with our team using the credentials you’ve signed up with.

  Access Your Portal: ${portalLink}

  We applaud your continued progress and thank you for learning with Orion Technical! Feel free to download your copy or share your certificate via our social links.

  If you have any questions or encounter any issues, please feel free to reach out to your instructor at mike@orion-technical.com.
  
  Good luck and enjoy your learning journey!
  The ${companyName} Team`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h3>Congratulations ${firstName},</h3>
            <p>You have successfully passed the ${courseName} exam and are now available at the Orion Technical Learning Portal.</p>
            
            <p>
              You now have access to our client portal where you can easily access your certifications, 
              track progress on exams, and stay connected with our team using the credentials you’ve signed up with.
            </p>

            <p style="margin-top: 20px;">
              🔗 <strong><a href="${portalLink}" style="color: #007BFF; text-decoration: none;">Access Your Portal</a></strong><br>
            </p>

            <p>
              We applaud your continued progress and thank you for learning with Orion Technical! Feel free to download your copy or share your certificate via our social links.
            </p>

            <p>
              If you have any questions or encounter any issues, please feel free to reach out to your instructor at mike@orion-technical.com.
            </p>

            <p>Good luck and enjoy your learning journey!<br>
            The <strong>${companyName}</strong> Team</p>
          </div>
        `,
      });

      console.log(`✅ Certificate ready email sent to ${to}`);
    } catch (error) {
      console.error('❌ Error sending certificate ready email:', error);
    }
  }
}
