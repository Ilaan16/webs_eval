import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dto/reservations.dto';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByUserId: jest.fn(),
    findByRoomId: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    keycloak_id: '123',
    created_at: new Date(),
  };

  const mockRoom: Room = {
    id: 1,
    name: 'Test Room',
    capacity: 10,
    location: 'Test Location',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated reservations', async () => {
      const reservations: Reservation[] = [
        {
          id: 1,
          userId: 1,
          roomId: 1,
          start_time: new Date(),
          end_time: new Date(),
          status: 'pending',
          created_at: new Date(),
          user: mockUser,
          room: mockRoom,
        },
        {
          id: 2,
          userId: 2,
          roomId: 2,
          start_time: new Date(),
          end_time: new Date(),
          status: 'pending',
          created_at: new Date(),
          user: mockUser,
          room: mockRoom,
        },
      ];

      mockReservationsService.findAll.mockResolvedValue(reservations);

      const result = await controller.findAll(0, 10);

      expect(result).toEqual(reservations);
      expect(service.findAll).toHaveBeenCalledWith({ skip: 0, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const expectedReservation: Reservation = {
        id: 1,
        userId: 1,
        roomId: 1,
        start_time: new Date(),
        end_time: new Date(),
        status: 'pending',
        created_at: new Date(),
        user: mockUser,
        room: mockRoom,
      };

      mockReservationsService.findOne.mockResolvedValue(expectedReservation);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedReservation);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        user_id: 1,
        room_id: 1,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      };
      const expectedReservation: Reservation = {
        id: 1,
        userId: 1,
        roomId: 1,
        start_time: new Date(createReservationDto.start_time),
        end_time: new Date(createReservationDto.end_time),
        status: 'pending',
        created_at: new Date(),
        user: mockUser,
        room: mockRoom,
      };

      mockReservationsService.create.mockResolvedValue(expectedReservation);

      const result = await controller.create(createReservationDto);

      expect(result).toEqual(expectedReservation);
      expect(service.create).toHaveBeenCalledWith(createReservationDto);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const updateReservationDto: UpdateReservationDto = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'approved',
      };
      const expectedReservation: Reservation = {
        id: 1,
        userId: 1,
        roomId: 1,
        start_time: new Date(updateReservationDto.startTime!),
        end_time: new Date(updateReservationDto.endTime!),
        status: 'approved',
        created_at: new Date(),
        user: mockUser,
        room: mockRoom,
      };

      mockReservationsService.update.mockResolvedValue(expectedReservation);

      const result = await controller.update(1, updateReservationDto);

      expect(result).toEqual(expectedReservation);
      expect(service.update).toHaveBeenCalledWith(1, updateReservationDto);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      mockReservationsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUserId', () => {
    it('should return reservations by user id', async () => {
      const reservations: Reservation[] = [
        {
          id: 1,
          userId: 1,
          roomId: 1,
          start_time: new Date(),
          end_time: new Date(),
          status: 'pending',
          created_at: new Date(),
          user: mockUser,
          room: mockRoom,
        },
      ];

      mockReservationsService.findByUserId.mockResolvedValue(reservations);

      const result = await controller.findByUserId(1);

      expect(result).toEqual(reservations);
      expect(service.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('findByRoomId', () => {
    it('should return reservations by room id', async () => {
      const reservations: Reservation[] = [
        {
          id: 1,
          userId: 1,
          roomId: 1,
          start_time: new Date(),
          end_time: new Date(),
          status: 'pending',
          created_at: new Date(),
          user: mockUser,
          room: mockRoom,
        },
      ];

      mockReservationsService.findByRoomId.mockResolvedValue(reservations);

      const result = await controller.findByRoomId(1);

      expect(result).toEqual(reservations);
      expect(service.findByRoomId).toHaveBeenCalledWith(1);
    });
  });
});
