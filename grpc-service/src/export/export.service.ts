import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reservation } from "../entities/reservation.entity";
import { MinioService } from "../minio/minio.service";

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly minioService: MinioService
  ) {}

  async exportReservations(userId: number): Promise<string> {
    // Récupérer toutes les réservations de l'utilisateur
    const reservations = await this.reservationRepository.find({
      where: { userId },
    });

    // Générer le contenu CSV
    const headers =
      "reservation_id,user_id,room_id,start_time,end_time,status\n";
    const rows = reservations
      .map(
        (reservation) =>
          `${reservation.id},${reservation.userId},${
            reservation.roomId
          },${reservation.startTime.toISOString()},${reservation.endTime.toISOString()},${
            reservation.status
          }`
      )
      .join("\n");

    const csvContent = headers + rows;

    // Générer un nom de fichier unique
    const timestamp = new Date().getTime();
    const fileName = `user_${userId}_${timestamp}.csv`;

    // Uploader sur MinIO et récupérer l'URL
    const url = await this.minioService.uploadFile(fileName, csvContent);

    return url;
  }
}
