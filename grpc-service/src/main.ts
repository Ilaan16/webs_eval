import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  
  // Création de l'application microservice gRPC
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['notifications', 'extracts'],
        protoPath: [
          join(__dirname, '../proto/service.proto'),
        ],
        url: process.env.GRPC_URL || '0.0.0.0:5000',
      },
    },
  );

  await app.listen();
  logger.log('gRPC Microservice is listening on port 5000');
}

bootstrap();
