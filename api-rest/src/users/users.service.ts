import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Générer un UUID pour keycloak_id s'il n'est pas fourni
    const userData = {
      ...createUserDto,
      keycloak_id: createUserDto.keycloak_id || uuidv4(),
    };
    
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll({ skip = 0, limit = 10 }): Promise<User[]> {
    return this.userRepository.find({
      skip,
      take: limit,
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByKeycloakId(keycloakId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { keycloak_id: keycloakId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with Keycloak ID ${keycloakId} not found`,
      );
    }
    return user;
  }
}
