import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Créer l'application REST
  const app = await NestFactory.create(AppModule);

  // Activer la validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Reservation API')
    .setDescription('API de gestion des réservations de salles')
    .setVersion('1.0')
    .addTag('users')
    .addTag('rooms')
    .addTag('reservations')
    .addTag('notifications')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuration CORS
  app.enableCors();

  // Démarrer le serveur REST
  await app.listen(process.env.PORT ?? 3000);

  // Créer le microservice gRPC
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'notifications',
        protoPath: join(__dirname, '../proto/notifications.proto'),
        url: 'localhost:50051',
        loader: {
          keepCase: true,
        },
      },
    },
  );

  // Démarrer le serveur gRPC
  await grpcApp.listen();
}
bootstrap();
