import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Notification } from '../entities/notification.entity';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dto/reservations.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
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

  async findOneForGraphQL(id: number): Promise<Reservation | null> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'room'],
    });
    return reservation || null;
  }

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const reservationData = {
      user: { id: parseInt(createReservationDto.user_id, 10) },
      room: { id: parseInt(createReservationDto.room_id, 10) },
      start_time: new Date(createReservationDto.start_time),
      end_time: new Date(createReservationDto.end_time),
      status: 'pending',
    } as any;
    const newReservation = await this.reservationRepository.save(reservationData);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        reservation: { id: newReservation.id } as any,
        message: `Reservation ${newReservation.id} created.`,
        notification_date: new Date(),
      }),
    );

    return this.findOne(newReservation.id);
  }

  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (updateReservationDto.start_time) {
      reservation.start_time = new Date(updateReservationDto.start_time);
    }
    if (updateReservationDto.end_time) {
      reservation.end_time = new Date(updateReservationDto.end_time);
    }

    const updatedReservation = await this.reservationRepository.save(reservation);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        reservation: { id: updatedReservation.id } as any,
        message: `Reservation ${updatedReservation.id} updated.`,
        notification_date: new Date(),
      }),
    );

    return this.findOne(updatedReservation.id);
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
