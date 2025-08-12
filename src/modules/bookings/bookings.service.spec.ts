import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  const mockBooking = {
    id: 1,
    userId: 6,
    roomId: 5,
    startTs: new Date('2025-08-11T17:05:00.000Z'),
    endTs: new Date('2025-08-11T18:05:00.000Z'),
    metadata: { notes: 'Требуется микрофон', projector: true },
    status: BookingStatus.CONFIRMED,
  };

  const prismaMock = {
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should return all bookings', async () => {
    prismaMock.booking.findMany.mockResolvedValue([mockBooking]);

    const result = await service.findAll();

    expect(result).toEqual([mockBooking]);
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith({
      include: { user: true, room: true },
      orderBy: { startTs: 'desc' },
    });
  });

  it('should return bookings by user', async () => {
    prismaMock.booking.findMany.mockResolvedValue([mockBooking]);

    const result = await service.findByUser(6);

    expect(result).toEqual([mockBooking]);
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith({
      where: { userId: 6 },
      include: { room: true },
      orderBy: { startTs: 'desc' },
    });
  });

  it('should throw if endTs <= startTs', async () => {
    const dto = {
      userId: 6,
      roomId: 5,
      startTs: new Date('2025-08-11T18:00:00.000Z'),
      endTs: new Date('2025-08-11T17:00:00.000Z'),
      metadata: {},
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw if user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const dto = {
      userId: 999,
      roomId: 5,
      startTs: new Date('2025-08-11T17:00:00.000Z'),
      endTs: new Date('2025-08-11T18:00:00.000Z'),
      metadata: {},
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it('should throw if room does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 6 });
    prismaMock.room.findUnique.mockResolvedValue(null);

    const dto = {
      userId: 6,
      roomId: 999,
      startTs: new Date('2025-08-11T17:00:00.000Z'),
      endTs: new Date('2025-08-11T18:00:00.000Z'),
      metadata: {},
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(prismaMock.room.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it('should throw if booking conflicts with existing', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 6 });
    prismaMock.room.findUnique.mockResolvedValue({ id: 5 });
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);

    const dto = {
      userId: 6,
      roomId: 5,
      startTs: new Date('2025-08-11T17:00:00.000Z'),
      endTs: new Date('2025-08-11T18:00:00.000Z'),
      metadata: {},
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should create a booking successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 6 });
    prismaMock.room.findUnique.mockResolvedValue({ id: 5 });
    prismaMock.booking.findFirst.mockResolvedValue(null);
    prismaMock.booking.create.mockResolvedValue(mockBooking);

    const dto = {
      userId: 6,
      roomId: 5,
      startTs: new Date('2025-08-11T17:00:00.000Z'),
      endTs: new Date('2025-08-11T18:00:00.000Z'),
      metadata: { notes: 'Требуется микрофон', projector: true },
    };

    const result = await service.create(dto);

    expect(prismaMock.booking.create).toHaveBeenCalledWith({
      data: {
        userId: dto.userId,
        roomId: dto.roomId,
        startTs: dto.startTs,
        endTs: dto.endTs,
        metadata: dto.metadata,
        status: BookingStatus.CONFIRMED,
      },
    });

    expect(result).toEqual(mockBooking);
  });

  it('should cancel a booking successfully', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking);
    prismaMock.booking.update.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.CANCELLED,
    });

    const result = await service.cancel(1, 6);

    expect(prismaMock.booking.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: BookingStatus.CANCELLED },
    });
    expect(result.status).toBe(BookingStatus.CANCELLED);
  });

  it('should throw NotFoundException if booking not found in cancel', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(null);

    await expect(service.cancel(1, 6)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if user not owner in cancel', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      ...mockBooking,
      userId: 7,
    });

    await expect(service.cancel(1, 6)).rejects.toThrow(BadRequestException);
  });
});
