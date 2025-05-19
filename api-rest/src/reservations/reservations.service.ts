import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dto/reservations.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll({ skip = 0, limit = 10 }): Promise<Reservation[]> {
    return this.reservationRepository.find({
      skip,
      take: limit,
      relations: ['user', 'room'],
    });
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'room'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const reservationData = {
      user: { id: createReservationDto.user_id },
      room: { id: createReservationDto.room_id },
      start_time: new Date(createReservationDto.start_time),
      end_time: new Date(createReservationDto.end_time),
      status: createReservationDto.status,
    };
    const newReservation = this.reservationRepository.create(reservationData);
    await this.reservationRepository.save(newReservation);

    await this.notificationsService.create({
      reservation_id: newReservation.id,
      message: `Reservation ${newReservation.id} created for user ${createReservationDto.user_id}`,
      notification_date: new Date(), 
    });

    return this.findOne(newReservation.id);
  }

  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (updateReservationDto.startTime) {
      reservation.start_time = new Date(updateReservationDto.startTime);
    }
    if (updateReservationDto.endTime) {
      reservation.end_time = new Date(updateReservationDto.endTime);
    }
    if (updateReservationDto.status) {
      reservation.status = updateReservationDto.status;
    }

    const updatedReservation = await this.reservationRepository.save(reservation);

    await this.notificationsService.create({
      reservation_id: updatedReservation.id,
      message: `Reservation ${updatedReservation.id} updated.`,
      notification_date: new Date(),
    });

    return updatedReservation;
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'room'],
    });
  }

  async findByRoomId(roomId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { room: { id: roomId } },
      relations: ['user', 'room'],
    });
  }
}
