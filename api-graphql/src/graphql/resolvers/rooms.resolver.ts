import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { RoomsService } from '../../rooms/rooms.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql-auth.guard';

@Resolver('Room')
@UseGuards(GqlAuthGuard)
export class RoomsResolver {
  constructor(private roomsService: RoomsService) {}

  @Query('listRooms')
  async listRooms(@Args('skip') skip?: number, @Args('limit') limit?: number) {
    return this.roomsService.findAll({ skip, limit });
  }

  @Query('room')
  async getRoom(@Args('id') id: number) {
    return this.roomsService.findOne(id);
  }

  @Mutation('createRoom')
  async createRoom(
    @Args('name') name: string,
    @Args('capacity') capacity: number,
    @Args('location') location?: string,
  ) {
    return this.roomsService.create({ name, capacity, location });
  }

  @Mutation('updateRoom')
  async updateRoom(
    @Args('id') id: number,
    @Args('name') name?: string,
    @Args('capacity') capacity?: number,
    @Args('location') location?: string,
  ) {
    return this.roomsService.update(id, { name, capacity, location });
  }

  @Mutation('deleteRoom')
  async deleteRoom(@Args('id') id: number) {
    await this.roomsService.remove(id);
    return true;
  }
} 