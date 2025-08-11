import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingDto } from './dto/bookings.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('all')
  async getAllBookings() {
    return this.bookingsService.findAll();
  }

  @Get('user/:userId')
  async getUserBookings(@Param('userId') userId: number) {
    return this.bookingsService.findByUser(userId);
  }

  @Post('create')
  async createBooking(@Body() data: BookingDto) {
    return this.bookingsService.create(data);
  }
}
