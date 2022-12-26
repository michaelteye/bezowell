import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPassword(name: string, email: string, password) {
    if (process.env.environment === 'production') {
      console.log('sending password');
      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" support@bezomoney.com', // override default from
        subject: 'Welcome to Bezomoney! Your Generated Password',
        template: './password',
        context: {
          name: name,
          email: email,
          password: password,
        },
      });
    }
  }

  async sendOtp(name: string, email: string, otp: any) {
    if (process.env.environment === 'production') {
      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" support@bezomoney.com', // override default from
        subject: 'Welcome to Bezomoney! Your Generated OTP Code',
        template: './otp',
        context: {
          name: name,
          email: email,
          otp: otp,
        },
      });
    }
  }
}
