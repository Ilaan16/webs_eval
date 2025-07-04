import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reservation } from "../entities/reservation.entity";
import { MinioService } from "../minio/minio.service";

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly minioService: MinioService
  ) {}

  async exportReservations(userId: number): Promise<string> {
    try {
      this.logger.log(`Starting export for user ${userId}`);
      
      // Récupérer toutes les réservations de l'utilisateur
      const reservations = await this.reservationRepository.find({
        where: { userId },
      });

      this.logger.log(`Found ${reservations.length} reservations for user ${userId}`);

      // Générer le contenu CSV
      const headers =
        "reservation_id,user_id,room_id,start_time,end_time,status\n";
      
      let rows = "";
      if (reservations.length > 0) {
        rows = reservations
          .map(
            (reservation) =>
              `${reservation.id},${reservation.userId},${
                reservation.roomId
              },${reservation.startTime.toISOString()},${reservation.endTime.toISOString()},${
                reservation.status
              }`
          )
          .join("\n");
      } else {
        // Si pas de réservations, créer une ligne vide avec les headers seulement
        this.logger.log(`No reservations found for user ${userId}, generating empty CSV`);
      }

      const csvContent = headers + rows;

      // Générer un nom de fichier unique
      const timestamp = new Date().getTime();
      const fileName = `user_${userId}_${timestamp}.csv`;

      this.logger.log(`Uploading file ${fileName} to MinIO`);
      
      // Uploader sur MinIO et récupérer l'URL
      const url = await this.minioService.uploadFile(fileName, csvContent);

      this.logger.log(`File uploaded successfully, URL: ${url}`);
      
      return url;
    } catch (error) {
      this.logger.error(`Export failed for user ${userId}:`, error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }
}
