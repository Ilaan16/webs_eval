import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

// Chemin relatif pour le développement local, absolue pour Docker
const protoPath = () => {
  const relativePath = join(__dirname, '../../proto/extract.proto');
  const dockerPath = join(process.cwd(), 'proto/extract.proto');

  return process.env.NODE_ENV === 'production' ? dockerPath : relativePath;
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'EXTRACTS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'extracts',
          protoPath: protoPath(),
          url:
            process.env.NODE_ENV === 'production'
              ? 'localhost:50052'
              : 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
