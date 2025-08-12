// auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: EmailService, // Assuming EmailService is imported correctly
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email, isConfirmed: true },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async confirmUser(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (user.isConfirmed) {
      throw new BadRequestException('Пользователь уже подтверждён');
    }

    if (!user.confirmCodeDate || user.confirmCodeDate < new Date()) {
      throw new BadRequestException('Срок действия кода подтверждения истёк');
    }

    const isMatch = await bcrypt.compare(code, user.confirmCode);

    if (!isMatch) {
      throw new BadRequestException('Неверный код подтверждения');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        isConfirmed: true,
        confirmCode: null,
        confirmCodeDate: null,
      },
    });

    return { message: 'Аккаунт успешно активирован' };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async generateActivationData() {
    const activationCode = ('000000' + randomInt(0, 999999)).slice(-6);
    const hashedCode = await bcrypt.hash(activationCode, 10);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // код действителен 15 минут
    return { activationCode, hashedCode, expires };
  }

  async register(data: { email: string; password: string; name?: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (!existingUser.isConfirmed) {
        if (existingUser.confirmCodeDate > new Date()) {
          throw new BadRequestException(
            'Код уже был выслан, проверьте почту или попробуйте позже.',
          );
        }

        // Код истёк — генерируем новый
        const { activationCode, hashedCode, expires } =
          await this.generateActivationData();

        await this.prisma.user.update({
          where: { email: data.email },
          data: {
            confirmCode: hashedCode,
            confirmCodeDate: expires,
          },
        });

        await this.mailService.sendActivationCode(
          existingUser.email,
          activationCode,
        );
        return {
          message: 'Новый код подтверждения отправлен на вашу почту.',
        };
      }

      throw new BadRequestException(
        'Пользователь с таким email уже зарегистрирован.',
      );
    }

    // Новый пользователь
    const { activationCode, hashedCode, expires } =
      await this.generateActivationData();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        confirmCode: hashedCode,
        confirmCodeDate: expires,
      },
    });

    await this.mailService.sendActivationCode(user.email, activationCode);

    const { password, confirmCode, confirmCodeDate, ...result } = user;
    return result;
  }
}
