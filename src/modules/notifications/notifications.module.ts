import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // чтобы использовать в других сервисах
})
export class NotificationsModule {}
