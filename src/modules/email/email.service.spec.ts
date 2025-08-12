import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeAll(() => {
    sendMailMock = jest.fn().mockResolvedValue(true);

    // Мокаем createTransport, чтобы вернуть объект с sendMail
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as any);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should send activation code email', async () => {
    const to = 'test@example.com';
    const code = '123456';

    await service.sendActivationCode(to, code);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject: 'Код активации аккаунта',
        html: expect.stringContaining(code),
      }),
    );
  });

  it('should send booking notification email', async () => {
    const to = 'user@example.com';
    const roomName = 'Конференц-зал';
    const startTs = new Date('2025-08-12T10:00:00Z');

    await service.sendBookingNotification(to, roomName, startTs);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject: expect.stringContaining(roomName),
        html: expect.stringContaining(roomName),
      }),
    );
  });

  it('should handle errors in sendBookingNotification gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      service.sendBookingNotification('fail@example.com', 'Зал', new Date()),
    ).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Ошибка отправки email уведомления:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
