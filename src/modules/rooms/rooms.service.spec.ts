import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/rooms.dto';

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  const mockRoom = {
    id: 1,
    name: 'Room 1',
    capacity: 5,
    photoUrl: 'url',
    equipment: { projector: true },
  };

  const prismaMock = {
    room: {
      findMany: jest.fn().mockResolvedValue([mockRoom]),
      findUnique: jest
        .fn()
        .mockImplementation(({ where: { id } }) =>
          Promise.resolve(id === mockRoom.id ? mockRoom : null),
        ),
      create: jest
        .fn()
        .mockImplementation(({ data }) => Promise.resolve({ id: 2, ...data })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return array of rooms', async () => {
    const rooms = await service.findAll();
    expect(rooms).toEqual([mockRoom]);
    expect(prisma.room.findMany).toHaveBeenCalled();
  });

  it('findOne should return a room by id', async () => {
    const room = await service.findOne(1);
    expect(room).toEqual(mockRoom);
    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    const noRoom = await service.findOne(999);
    expect(noRoom).toBeNull();
  });

  it('create should create and return new room', async () => {
    const dto: CreateRoomDto = {
      name: 'Room 2',
      capacity: 10,
      photoUrl: 'url2',
      equipment: { projector: false },
    };
    const created = await service.create(dto);
    expect(created).toEqual({ id: 2, ...dto });
    expect(prisma.room.create).toHaveBeenCalledWith({
      data: dto,
    });
  });
});
