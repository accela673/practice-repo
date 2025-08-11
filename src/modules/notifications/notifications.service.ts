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
    this.logger.log(`Cron job running at: ${now.toISOString()}`);

    const notifyWindowStart = new Date(now.getTime() + 29 * 60 * 1000); // 29 минут
    const notifyWindowEnd = new Date(now.getTime() + 32 * 60 * 1000); // 32 минуты

    this.logger.log(
      `Looking for bookings starting between ${notifyWindowStart.toISOString()} and ${notifyWindowEnd.toISOString()}`,
    );

    try {
      const bookings = await this.prisma.booking.findMany({
        where: {
          startTs: {
            gte: notifyWindowStart,
            lt: notifyWindowEnd,
          },
          status: 'CONFIRMED',
        },
        include: {
          user: true,
          room: true,
        },
      });

      this.logger.log(`Found ${bookings.length} bookings to notify`);

      for (const booking of bookings) {
        try {
          await this.emailService.sendBookingNotification(
            booking.user.email,
            booking.room.name,
            booking.startTs,
          );
          this.logger.log(
            `Email sent to ${booking.user.email} for booking starting at ${booking.startTs.toISOString()}`,
          );

          this.notificationsGateway.sendBookingNotification({
            userId: booking.userId,
            roomName: booking.room.name,
            startTs: booking.startTs,
          });
          this.logger.log(
            `WebSocket notification sent to userId ${booking.userId}`,
          );
        } catch (notificationError) {
          this.logger.error(
            `Failed to send notifications for booking ID ${booking.id}`,
            notificationError.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to fetch bookings from database', error.stack);
    }
  }
}
