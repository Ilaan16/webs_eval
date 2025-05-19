import { Injectable } from '@nestjs/common';
import { ReservationsService } from '../../reservations/reservations.service';
import { MinioService } from '../../minio/minio.service';

@Injectable()
export class ExtractsService {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly minioService: MinioService,
  ) {}

  async generateUserExtract(userId: number): Promise<string> {
    // Get all reservations for the user
    const reservations = await this.reservationsService.findByUserId(userId);

    // Generate CSV content
    let csvContent =
      'reservationId,userId,roomId,startTime,endTime,status\n';
    const rows = reservations
      .map(
        (reservation) =>
          `${reservation.id},${reservation.userId},${reservation.roomId},${reservation.start_time.toISOString()},${reservation.end_time.toISOString()},${reservation.status}`,
      )
      .join('\n');

    csvContent += rows;

    // Generate unique filename
    const timestamp = new Date().getTime();
    const fileName = `user_${userId}_${timestamp}.csv`;

    // Upload to MinIO and get URL
    const url = await this.minioService.uploadFile(fileName, csvContent);

    return url;
  }
}
