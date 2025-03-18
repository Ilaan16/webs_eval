import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(keycloak_id: string, email?: string): Promise<User> {
    const newUser = this.userRepository.create({ keycloak_id, email });
    return this.userRepository.save(newUser);
  }
}
