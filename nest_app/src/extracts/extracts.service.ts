import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ExtractsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private minioService: MinioService,
  ) {}

  async generateUserExtract(userId: number): Promise<string> {
    const reservations = await this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'room'],
    });

    const csvContent = this.generateCsvContent(reservations);
    const fileName = `user_${userId}_extract_${Date.now()}.csv`;

    const url = await this.minioService.uploadFile(fileName, csvContent);

    return url;
  }

  private generateCsvContent(reservations: Reservation[]): string {
    const headers = [
      'reservation_id',
      'user_id',
      'room_id',
      'start_time',
      'end_time',
      'status',
    ].join(',');

    const rows = reservations.map((reservation) =>
      [
        reservation.id,
        reservation.user.id,
        reservation.room.id,
        reservation.start_time,
        reservation.end_time,
        reservation.status,
      ].join(','),
    );

    return [headers, ...rows].join('\n');
  }
}
