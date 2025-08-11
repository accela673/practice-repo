import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.room.findMany();
  }
  async findOne(id: number) {
    return this.prisma.room.findUnique({
      where: { id: id },
    });
  }
  async create(data: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        photoUrl: data.photoUrl,
        equipment: data.equipment,
      },
    });
  }
}
