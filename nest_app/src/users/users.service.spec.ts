import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        keycloak_id: '123',
      };
      const expectedUser: User = {
        id: 1,
        email: 'test@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users: User[] = [
        {
          id: 1,
          email: 'test1@example.com',
          keycloak_id: '123',
          created_at: new Date(),
        },
        {
          id: 2,
          email: 'test2@example.com',
          keycloak_id: '456',
          created_at: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll({ skip: 0, limit: 10 });

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedUser: User = {
        id: 1,
        email: 'test@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const existingUser: User = {
        id: 1,
        email: 'test@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };
      const updatedUser: User = {
        ...existingUser,
        email: 'updated@example.com',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { email: 'test@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByKeycloakId', () => {
    it('should return a user by keycloak id', async () => {
      const expectedUser: User = {
        id: 1,
        email: 'test@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findByKeycloakId('123');

      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { keycloak_id: '123' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByKeycloakId('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
