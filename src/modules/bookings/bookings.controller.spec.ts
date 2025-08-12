import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingDto } from './dto/bookings.dto';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  const mockBooking = {
    id: 1,
    userId: 6,
    roomId: 5,
    startTs: new Date('2025-08-11T17:05:00.000Z'),
    endTs: new Date('2025-08-11T18:05:00.000Z'),
    metadata: { notes: 'Требуется микрофон', projector: true },
    status: 'CONFIRMED',
  };

  const mockBookingsService = {
    findAll: jest.fn().mockResolvedValue([mockBooking]),
    findByUser: jest
      .fn()
      .mockImplementation((userId: number) =>
        Promise.resolve(userId === 6 ? [mockBooking] : []),
      ),
    create: jest
      .fn()
      .mockImplementation((dto: BookingDto) =>
        Promise.resolve({ id: 2, ...dto }),
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: mockBookingsService }],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllBookings should return an array of bookings', async () => {
    const result = await controller.getAllBookings();
    expect(result).toEqual([mockBooking]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('getUserBookings should return bookings for a specific user', async () => {
    const userId = 6;
    const result = await controller.getUserBookings(userId);
    expect(result).toEqual([mockBooking]);
    expect(service.findByUser).toHaveBeenCalledWith(userId);

    const emptyResult = await controller.getUserBookings(999);
    expect(emptyResult).toEqual([]);
  });

  it('createBooking should create and return a booking', async () => {
    const dto: BookingDto = {
      userId: 6,
      roomId: 5,
      startTs: new Date('2025-08-11T17:05:00.000Z'),
      endTs: new Date('2025-08-11T18:05:00.000Z'),
      metadata: { notes: 'Требуется микрофон', projector: true },
    };
    const result = await controller.createBooking(dto);
    expect(result).toEqual({ id: 2, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
