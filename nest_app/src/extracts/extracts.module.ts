import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ExtractsService } from './extracts.service';
import { ExtractsController } from './extracts.controller';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), MinioModule],
  controllers: [ExtractsController],
  providers: [ExtractsService],
  exports: [ExtractsService],
})
export class ExtractsModule {}
