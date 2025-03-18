import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from '../entities/reservation.entity';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dto/reservations.dto';
import { NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: Repository<Reservation>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
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
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.find.mockResolvedValue(reservations);

      const result = await service.findAll({ skip: 0, limit: 10 });

      expect(result).toEqual(reservations);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['user', 'room'],
      });
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

      mockRepository.findOne.mockResolvedValue(expectedReservation);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedReservation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'room'],
      });
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
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

      mockRepository.create.mockReturnValue(expectedReservation);
      mockRepository.save.mockResolvedValue(expectedReservation);

      const result = await service.create(createReservationDto);

      expect(result).toEqual(expectedReservation);
      expect(repository.create).toHaveBeenCalledWith(createReservationDto);
      expect(repository.save).toHaveBeenCalledWith(expectedReservation);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const updateReservationDto: UpdateReservationDto = {
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        status: 'approved',
      };
      const existingReservation: Reservation = {
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
      const updatedReservation: Reservation = {
        ...existingReservation,
        start_time: new Date(updateReservationDto.start_time!),
        end_time: new Date(updateReservationDto.end_time!),
        status: 'approved',
      };

      mockRepository.findOne.mockResolvedValue(existingReservation);
      mockRepository.save.mockResolvedValue(updatedReservation);

      const result = await service.update(1, updateReservationDto);

      expect(result).toEqual(updatedReservation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'room'],
      });
      expect(repository.save).toHaveBeenCalledWith(updatedReservation);
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { start_time: new Date().toISOString() }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      const reservation: Reservation = {
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

      mockRepository.findOne.mockResolvedValue(reservation);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'room'],
      });
      expect(repository.remove).toHaveBeenCalledWith(reservation);
    });

    it('should throw NotFoundException when reservation is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
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

      mockRepository.find.mockResolvedValue(reservations);

      const result = await service.findByUserId(1);

      expect(result).toEqual(reservations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['user', 'room'],
      });
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

      mockRepository.find.mockResolvedValue(reservations);

      const result = await service.findByRoomId(1);

      expect(result).toEqual(reservations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { room: { id: 1 } },
        relations: ['user', 'room'],
      });
    });
  });
});
