import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExportService } from "./export.service";
import { ExportController } from "./export.controller";
import { Reservation } from "../entities/reservation.entity";
import { MinioModule } from "../minio/minio.module";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), MinioModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
