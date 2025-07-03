import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Notification } from "./entities/notification.entity";
import { Reservation } from "./entities/reservation.entity";
import { ExportModule } from "./export/export.module";
import { NotificationModule } from "./notification/notification.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432", 10),
      username: process.env.DATABASE_USERNAME || "pguser",
      password: process.env.DATABASE_PASSWORD || "pgpass",
      database: process.env.DATABASE_NAME || "pgdb",
      entities: [Notification, Reservation],
      synchronize: true,
    }),
    AuthModule,
    NotificationModule,
    ExportModule,
  ],
})
export class AppModule {}
