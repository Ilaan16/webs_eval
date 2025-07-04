import { Module } from '@nestjs/common';
import { ExtractsModule } from './extracts/extracts.module';

@Module({
  imports: [ExtractsModule],
  exports: [ExtractsModule],
})
export class GrpcModule {}
