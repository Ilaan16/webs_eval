import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MinioModule } from './minio/minio.module';
import { GrpcModule } from './grpc/grpc.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'pguser',
      password: process.env.DATABASE_PASSWORD || 'pgpass',
      database: process.env.DATABASE_NAME || 'pgdb',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    NotificationsModule,
    MinioModule,
    GrpcModule,
  ],
})
export class AppModule {}
