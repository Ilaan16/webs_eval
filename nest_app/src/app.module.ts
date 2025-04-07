import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExtractsModule } from './extracts/extracts.module';
import { MinioModule } from './minio/minio.module';
import { User } from './entities/user.entity';
import { Room } from './entities/room.entity';
import { Reservation } from './entities/reservation.entity';
import { Notification } from './entities/notification.entity';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersModule} from './users/users.module';
import {RoomsModule} from './rooms/rooms.module';
import {ReservationsModule} from './reservations/reservations.module';
import {NotificationsModule} from './notifications/notifications.module';
import {AuthModule} from "./auth/auth.module";
import {GraphQLAppModule} from "./graphql/graphql.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'pguser',
      password: 'pgpass',
      database: 'pgdb',
      entities: [User, Room, Reservation, Notification],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
    RoomsModule,
    ReservationsModule,
    NotificationsModule,
    ExtractsModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
