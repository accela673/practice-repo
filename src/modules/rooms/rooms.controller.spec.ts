import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/rooms.dto';

describe('RoomsController', () => {
  let roomsController: RoomsController;
  let roomsService: RoomsService;

  const mockRoomsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [{ provide: RoomsService, useValue: mockRoomsService }],
    }).compile();

    roomsController = module.get<RoomsController>(RoomsController);
    roomsService = module.get<RoomsService>(RoomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('should return an array of rooms', async () => {
      const roomsArray = [
        { id: 1, name: 'Room A' },
        { id: 2, name: 'Room B' },
      ];
      mockRoomsService.findAll.mockResolvedValue(roomsArray);

      const result = await roomsController.getAllRooms();
      expect(result).toEqual(roomsArray);
      expect(mockRoomsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoomById', () => {
    it('should return a single room by id', async () => {
      const room = { id: 1, name: 'Room A' };
      mockRoomsService.findOne.mockResolvedValue(room);

      const result = await roomsController.getRoomById(1);
      expect(result).toEqual(room);
      expect(mockRoomsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createRoom', () => {
    it('should create and return a new room', async () => {
      const dto: CreateRoomDto = {
        name: 'New Room',
        capacity: 10,
        equipment: {},
        photoUrl: '',
      };
      const createdRoom = { id: 3, ...dto };

      mockRoomsService.create.mockResolvedValue(createdRoom);

      const result = await roomsController.createRoom(dto);
      expect(result).toEqual(createdRoom);
      expect(mockRoomsService.create).toHaveBeenCalledWith(dto);
    });
  });
});
