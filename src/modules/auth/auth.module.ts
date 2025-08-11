import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // важно указать defaultStrategy
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // лучше в .env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // добавь JwtStrategy сюда
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy], // если планируешь использовать Guard вне AuthModule
})
export class AuthModule {}
