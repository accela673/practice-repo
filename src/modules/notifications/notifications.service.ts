import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    const notifyTime = new Date(now.getTime() + 30 * 60 * 1000); // через 30 минут
    const endNotifyTime = new Date(notifyTime.getTime() + 3 * 60 * 1000); // +3 минуты на запас

    console.log('=== Cron job started ===');
    console.log('Current time:', now.toISOString());
    console.log(
      'Looking for bookings between',
      notifyTime.toISOString(),
      'and',
      new Date(notifyTime.getTime() + 3 * 60 * 1000).toISOString(),
    );

    const bookings = await this.prisma.booking.findMany({
      where: {
        startTs: {
          gte: notifyTime,
          lt: new Date(notifyTime.getTime() + 3 * 60 * 1000),
        },
        status: 'CONFIRMED',
      },
      include: {
        user: true,
        room: true,
      },
    });

    console.log(`Found ${bookings.length} bookings to notify`);

    if (bookings.length === 0) {
      console.log('No bookings to notify this cycle');
    }

    for (const booking of bookings) {
      console.log(
        'Processing booking:',
        booking.id,
        booking.startTs.toISOString(),
      );

      try {
        await this.emailService.sendBookingNotification(
          booking.user.email,
          booking.room.name,
          booking.startTs,
        );
        console.log(`Email sent to ${booking.user.email}`);

        this.notificationsGateway.sendBookingNotification({
          userId: booking.userId,
          roomName: booking.room.name,
          startTs: booking.startTs,
        });
        console.log(`WebSocket notification sent to userId ${booking.userId}`);
      } catch (error) {
        console.error(
          `Error sending notification for booking ${booking.id}`,
          error,
        );
      }
    }
    console.log('=== Cron job finished ===');
  }
}
