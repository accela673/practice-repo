import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendActivationCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL}>`,
      to,
      subject: 'Код активации аккаунта',
      html: `
      <h1>Ваш код активации</h1>
      <p>Введите следующий код в приложении для активации аккаунта:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>Код действителен 15 минут.</p>
    `,
    });
  }
}
