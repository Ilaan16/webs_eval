import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLAppModule } from './graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || process.env.DB_USER || 'pguser',
      password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'pgpass',
      database: process.env.DATABASE_NAME || process.env.DB_NAME || 'pgdb',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    GraphQLAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
