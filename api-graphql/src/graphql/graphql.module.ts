import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersResolver } from './resolvers/users.resolver';
import { RoomsResolver } from './resolvers/rooms.resolver';
import { ReservationsResolver } from './resolvers/reservations.resolver';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { ReservationsService } from '../reservations/reservations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Reservation } from '../entities/reservation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql/graphql.schema.ts'),
        outputAs: 'class',
      },
      context: ({ req }) => ({ req }),
      // Configuration for authentication
      installSubscriptionHandlers: true,
      playground: true,
    }),
    TypeOrmModule.forFeature([User, Room, Reservation]),
    AuthModule,
  ],
  providers: [
    UsersResolver,
    RoomsResolver,
    ReservationsResolver,
    UsersService,
    RoomsService,
    ReservationsService,
  ],
})
export class GraphQLAppModule {} 