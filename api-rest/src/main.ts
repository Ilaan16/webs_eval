import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Reservation API')
    .setDescription('API de gestion des réservations de salles')
    .setVersion('1.0')
    .addTag('users')
    .addTag('rooms')
    .addTag('reservations')
    .addTag('notifications')
    .addTag('extracts')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);

  // Ensure proto directories exist
  const protoDir = join(process.cwd(), 'proto');
  if (!fs.existsSync(protoDir)) {
    fs.mkdirSync(protoDir, { recursive: true });
  }

  // Contenu du fichier extract.proto à créer directement
  const extractProtoContent = `syntax = "proto3";

package extracts;

service Extracts {
    rpc GenerateUserExtract (GenerateUserExtractRequest) returns (GenerateUserExtractResponse) {}
}

message GenerateUserExtractRequest {
    int32 user_id = 1;
}

message GenerateUserExtractResponse {
    string url = 1;
}`;

  // Créer le fichier extract.proto directement
  const extractProtoPath = join(protoDir, 'extract.proto');
  if (!fs.existsSync(extractProtoPath)) {
    fs.writeFileSync(extractProtoPath, extractProtoContent);
    console.log(`Created extract.proto at ${extractProtoPath}`);
  }

  // Contenu du fichier notifications.proto
  const notificationsProtoContent = `syntax = "proto3";

package notifications;

service Notifications {
    rpc SendNotification (NotificationRequest) returns (NotificationResponse) {}
}

message NotificationRequest {
    int32 user_id = 1;
    string message = 2;
    string type = 3;
}

message NotificationResponse {
    bool success = 1;
    string message = 2;
}`;

  // Créer le fichier notifications.proto directement
  const notificationsProtoPath = join(protoDir, 'notifications.proto');
  if (!fs.existsSync(notificationsProtoPath)) {
    fs.writeFileSync(notificationsProtoPath, notificationsProtoContent);
    console.log(`Created notifications.proto at ${notificationsProtoPath}`);
  }

  // Notifications gRPC service
  const notificationsGrpcApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: 'notifications',
        protoPath: join(process.cwd(), 'proto/notifications.proto'),
        url: '0.0.0.0:50051',
        loader: {
          keepCase: true,
        },
      },
    });

  // Extracts gRPC service
  const extractsGrpcApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.GRPC,
      options: {
        package: 'extracts',
        protoPath: join(process.cwd(), 'proto/extract.proto'),
        url: '0.0.0.0:50052',
        loader: {
          keepCase: true,
        },
      },
    });

  await Promise.all([notificationsGrpcApp.listen(), extractsGrpcApp.listen()]);
}

bootstrap();
