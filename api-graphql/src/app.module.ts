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
import { GraphQLAppModule } from './graphql/graphql.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'nest_app',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLAppModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    NotificationsModule,
    ExtractsModule,
    MinioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
