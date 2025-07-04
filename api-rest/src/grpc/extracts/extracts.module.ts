import { Module } from '@nestjs/common';
import { ExtractsService } from './extracts.service';
import { ExtractsController } from './extracts.controller';
import { ReservationsModule } from '../../reservations/reservations.module';
import { MinioModule } from '../../minio/minio.module';

@Module({
  imports: [ReservationsModule, MinioModule],
  controllers: [ExtractsController],
  providers: [ExtractsService],
  exports: [ExtractsService],
})
export class ExtractsModule {}
