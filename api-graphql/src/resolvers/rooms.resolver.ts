import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { RoomsService } from '../rooms/rooms.service';
import { UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';

@Resolver('Room')
@UseGuards(KeycloakAuthGuard)
export class RoomsResolver {
  constructor(private roomsService: RoomsService) {}

  @Query('listRooms')
  async listRooms(@Args('skip') skip?: number, @Args('limit') limit?: number) {
    return this.roomsService.findAll({ skip, limit });
  }

  @Query('room')
  async getRoom(@Args('id') id: string) {
    return this.roomsService.findOne(parseInt(id, 10));
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
    @Args('id') id: string,
    @Args('name') name?: string,
    @Args('capacity') capacity?: number,
    @Args('location') location?: string,
  ) {
    return this.roomsService.update(parseInt(id, 10), { name, capacity, location });
  }

  @Mutation('deleteRoom')
  async deleteRoom(@Args('id') id: string) {
    await this.roomsService.remove(parseInt(id, 10));
    return true;
  }
} 