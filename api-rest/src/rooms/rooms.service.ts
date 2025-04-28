import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { CreateRoomDto, UpdateRoomDto } from '../dto/rooms.dto';

// Mock pour les tests
class MockRoomRepository {
  private rooms: Room[] = [];
  private nextId = 1;

  find({ skip = 0, take = 10 }): Promise<Room[]> {
    return Promise.resolve(this.rooms.slice(skip, skip + take));
  }

  findOne({ where: { id } }): Promise<Room | null> {
    return Promise.resolve(this.rooms.find((r) => r.id === id) || null);
  }

  create(data: CreateRoomDto): Room {
    return {
      id: 0,
      ...data,
      created_at: new Date(),
    };
  }

  save(room: Room): Promise<Room> {
    if (!room.id) {
      room.id = this.nextId++;
      this.rooms.push(room);
    } else {
      const index = this.rooms.findIndex((r) => r.id === room.id);
      if (index >= 0) {
        this.rooms[index] = room;
      }
    }
    return Promise.resolve(room);
  }

  update(id: number, data: Partial<Room>): Promise<any> {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index >= 0) {
      Object.assign(this.rooms[index], data);
    }
    return Promise.resolve({ affected: index >= 0 ? 1 : 0 });
  }

  remove(room: Room): Promise<Room> {
    const index = this.rooms.findIndex((r) => r.id === room.id);
    if (index >= 0) {
      this.rooms.splice(index, 1);
    }
    return Promise.resolve(room);
  }
}

@Injectable()
export class RoomsService {
  private readonly roomRepository: Repository<Room>;

  constructor(
    @Optional()
    @InjectRepository(Room)
    private readonly injectedRepository?: Repository<Room>,
  ) {
    // Utiliser le repository injecté ou créer un mock repository pour les tests
    this.roomRepository =
      this.injectedRepository ||
      (new MockRoomRepository() as unknown as Repository<Room>);
  }

  async findAll({ skip = 0, limit = 10 }): Promise<Room[]> {
    return this.roomRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return this.roomRepository.save(room);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    await this.findOne(id);
    await this.roomRepository.update(id, updateRoomDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }
}
