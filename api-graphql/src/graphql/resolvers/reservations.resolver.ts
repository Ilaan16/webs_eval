import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ReservationsService } from '../../reservations/reservations.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql-auth.guard';

@Resolver('Reservation')
@UseGuards(GqlAuthGuard)
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
    @Args('start_time') start_time: Date,
    @Args('end_time') end_time: Date,
  ) {
    return this.reservationsService.create({
      user_id,
      room_id,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
    });
  }

  @Mutation('updateReservation')
  async updateReservation(
    @Args('id') id: number,
    @Args('user_id') user_id?: number,
    @Args('room_id') room_id?: number,
    @Args('start_time') start_time?: Date,
    @Args('end_time') end_time?: Date,
  ) {
    return this.reservationsService.update(id, {
      user_id,
      room_id,
      start_time: start_time?.toISOString(),
      end_time: end_time?.toISOString(),
    });
  }

  @Mutation('deleteReservation')
  async deleteReservation(@Args('id') id: number) {
    await this.reservationsService.remove(id);
    return true;
  }
} 