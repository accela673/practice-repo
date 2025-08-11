import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/rooms.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  @Get('all')
  @ApiOperation({ summary: 'Получить список всех комнат' })
  @ApiResponse({ status: 200, description: 'Список комнат успешно получен.' })
  async getAllRooms() {
    return this.roomsService.findAll();
  }

  @Get('one/:id')
  @ApiOperation({ summary: 'Получить комнату по ID' })
  @ApiResponse({ status: 200, description: 'Комната успешно получена.' })
  async getRoomById(@Param('id') id: number) {
    return this.roomsService.findOne(+id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создать новую комнату' })
  @ApiResponse({ status: 201, description: 'Комната успешно создана.' })
  async createRoom(@Body() data: CreateRoomDto) {
    return this.roomsService.create(data);
  }
}
