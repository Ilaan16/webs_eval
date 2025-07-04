import { Resolver, Query, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';
import { ReservationsService } from '../reservations/reservations.service';
import { UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationDto, UpdateReservationDto } from '../dto/reservations.dto';

@Resolver('Reservation')
@UseGuards(KeycloakAuthGuard)
export class ReservationsResolver {
  constructor(private reservationsService: ReservationsService) {}

  @Query('listReservations')
  async listReservations(@Args('skip') skip?: number, @Args('limit') limit?: number) {
    return this.reservationsService.findAll({ skip, limit });
  }

  @Query('reservation')
  async getReservation(@Args('id') id: string) {
    return this.reservationsService.findOneForGraphQL(parseInt(id, 10));
  }

  @Mutation('createReservation')
  async createReservation(
    @Args('user_id') user_id: string,
    @Args('room_id') room_id: string,
    @Args('start_time') start_time: string,
    @Args('end_time') end_time: string,
  ) {
    const createReservationDto: CreateReservationDto = {
      user_id,
      room_id,
      start_time,
      end_time,
    };
    return this.reservationsService.create(createReservationDto);
  }

  @Mutation('updateReservation')
  async updateReservation(
    @Args('id') id: string,
    @Args('start_time') start_time?: string,
    @Args('end_time') end_time?: string,
  ) {
    const updateReservationDto: UpdateReservationDto = {
      id,
      start_time,
      end_time,
    };
    return this.reservationsService.update(parseInt(id, 10), updateReservationDto);
  }

  @Mutation('deleteReservation')
  async deleteReservation(@Args('id') id: string) {
    await this.reservationsService.remove(parseInt(id, 10));
    return true;
  }

  @ResolveField('user_id')
  resolveUserId(@Parent() reservation: Reservation) {
    return reservation.userId;
  }

  @ResolveField('room_id')
  resolveRoomId(@Parent() reservation: Reservation) {
    return reservation.roomId;
  }
} 