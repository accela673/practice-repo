import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingDto } from './dto/bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Получить все бронирования (можно добавить пагинацию)
  async findAll() {
    return this.prisma.booking.findMany({
      include: { user: true, room: true },
      orderBy: { startTs: 'desc' },
    });
  }

  // Получить бронирования пользователя
  async findByUser(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { startTs: 'desc' },
    });
  }

  // Создать бронирование с проверкой пересечения времени по комнате
  async create(data: BookingDto) {
    if (data.endTs <= data.startTs) {
      throw new BadRequestException(
        'Время окончания должно быть позже времени начала',
      );
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!userExists) {
      throw new BadRequestException(
        `Пользователь с id=${data.userId} не найден`,
      );
    }

    const roomExists = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });
    if (!roomExists) {
      throw new BadRequestException(`Комната с id=${data.roomId} не найдена`);
    }

    // Проверяем пересечения бронирований для этой комнаты
    const conflict = await this.prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: BookingStatus.CONFIRMED, // учитываем только подтвержденные
        OR: [
          {
            startTs: { lt: data.endTs },
            endTs: { gt: data.startTs },
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Данное время уже занято для этой комнаты');
    }

    return await this.prisma.booking.create({
      data: {
        userId: data.userId,
        roomId: data.roomId,
        startTs: data.startTs,
        endTs: data.endTs,
        metadata: data.metadata || {},
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  // Отмена бронирования (обновляем статус)
  async cancel(bookingId: number, userId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Бронирование не найдено');
    if (booking.userId !== userId)
      throw new BadRequestException('Нет доступа отменить это бронирование');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
  }
}
