import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { CreateSupportmoduleDto } from './dto/create-supportmodule.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  async sendSupportTicket(
    createSupportTicketDto: CreateSupportmoduleDto,
    user: User,
  ) {
    const { subject, message } = createSupportTicketDto;
    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL');

    await this.mailerService.sendMail({
      to: supportEmail,
      subject: `New Support Ticket: ${subject}`,
      template: './support-ticket', // You can create an HTML template later
      context: {
        subject,
        message,
        userName: user.name,
        userEmail: user.email,
      },
      html: `
        <h1>New Support Ticket</h1>
        <p>A new support ticket has been submitted.</p>
        <hr>
        <h2><strong>User Details</strong></h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <hr>
        <h2><strong>Message</strong></h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return { message: 'Support ticket submitted successfully.' };
  }
}
