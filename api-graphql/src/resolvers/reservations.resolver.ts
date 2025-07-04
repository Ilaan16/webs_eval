import { Resolver, Query, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';
import { ReservationsService } from '../reservations/reservations.service';
import { UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';

@Resolver('Reservation')
@UseGuards(KeycloakAuthGuard)
export class ReservationsResolver {
  constructor(private reservationsService: ReservationsService) {}

  @Query('listReservations')
  async listReservations(@Args('skip') skip?: number, @Args('limit') limit?: number) {
    return this.reservationsService.findAll({ skip, limit });
  }

  @Query('reservation')
  async getReservation(@Args('id') id: number) {
    return this.reservationsService.findOne(id);
  }

  @Mutation('createReservation')
  async createReservation(
    @Args('user_id') user_id: number,
    @Args('room_id') room_id: number,
    @Args('start_time') start_time: string,
    @Args('end_time') end_time: string,
  ) {
    return this.reservationsService.create({
      user_id,
      room_id,
      start_time,
      end_time,
    });
  }

  @Mutation('updateReservation')
  async updateReservation(
    @Args('id') id: number,
    @Args('user_id') user_id?: number,
    @Args('room_id') room_id?: number,
    @Args('start_time') start_time?: string,
    @Args('end_time') end_time?: string,
  ) {
    return this.reservationsService.update(id, {
      user_id,
      room_id,
      start_time,
      end_time,
    });
  }

  @Mutation('deleteReservation')
  async deleteReservation(@Args('id') id: number) {
    await this.reservationsService.remove(id);
    return true;
  }

  @ResolveField('user_id')
  resolveUserId(@Parent() reservation) {
    return reservation.userId;
  }

  @ResolveField('room_id')
  resolveRoomId(@Parent() reservation) {
    return reservation.roomId;
  }
} 