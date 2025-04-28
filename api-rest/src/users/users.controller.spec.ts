import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByKeycloakId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
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

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(0, 10);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith({ skip: 0, limit: 10 });
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

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const expectedUser: User = {
        id: 1,
        email: 'updated@example.com',
        keycloak_id: '123',
        created_at: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
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

      mockUsersService.findByKeycloakId.mockResolvedValue(expectedUser);

      const result = await controller.findByKeycloakId('123');

      expect(result).toEqual(expectedUser);
      expect(service.findByKeycloakId).toHaveBeenCalledWith('123');
    });
  });
});
