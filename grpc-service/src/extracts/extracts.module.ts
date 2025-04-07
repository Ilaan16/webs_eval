import { Module } from '@nestjs/common';
import { ExtractsService } from './extracts.service';

@Module({
  providers: [ExtractsService],
  exports: [ExtractsService],
})
export class ExtractsModule {} 