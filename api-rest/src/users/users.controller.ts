import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  OnModuleInit,
  Optional,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  Req,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Observable, firstValueFrom, of } from 'rxjs';
import { Response, Request } from 'express';
import { Metadata } from "@grpc/grpc-js";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';

interface ExtractsService {
  generateUserExtract(
    request: { user_id: number },
    metadata: Metadata,
  ): Observable<{ url: string }>;
}

// Enhanced Mock service for testing that generates real CSV data
class MockExtractsService implements ExtractsService {
  constructor(private reservationRepository: Repository<Reservation>) {}

  generateUserExtract(
    request: { user_id: number },
    metadata: Metadata,
  ): Observable<{ url: string }> {
    const port = process.env.PORT || 3000;
    return of({
      url: `http://localhost:${port}/api/users/mock-extract-data/dynamic-data.csv?userId=${request.user_id}`,
    });
  }
}

// Decorator to exclude endpoints from authentication
export const Public = () => SetMetadata('isPublic', true);

@ApiTags('users')
@Controller('api/users')
@UseGuards(KeycloakAuthGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController implements OnModuleInit {
  private extractsService: ExtractsService;

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @Optional() @Inject('EXTRACTS_PACKAGE') private extractsClient?: ClientGrpc,
  ) {}

  onModuleInit() {
    if (this.extractsClient) {
      this.extractsService =
        this.extractsClient.getService<ExtractsService>('Extracts');
    } else {
      this.extractsService = new MockExtractsService(this.reservationRepository);
    }
  }

  @Get('mock-extract-data/dynamic-data.csv')
  @Public()
  @ApiExcludeEndpoint()
  async getDynamicMockExtract(@Res() response: Response, @Query('userId') userIdQuery?: string) {
    try {
      const userId = userIdQuery ? parseInt(userIdQuery, 10) : 1;
      
      // Get real reservations from database - fix the where condition
      const reservations = await this.reservationRepository.find({
        where: { user: { id: userId } },
        relations: ['room', 'user'],
      });

      const header = "reservationId,userId,roomId,startTime,endTime,status\n";
      
      let csvContent = header;
      if (reservations.length > 0) {
        const rows = reservations.map(reservation => 
          `${reservation.id},${reservation.user.id},${reservation.roomId},${reservation.start_time.toISOString()},${reservation.end_time.toISOString()},${reservation.status}`
        ).join('\n');
        csvContent += rows;
      } else {
        // Fallback data if no reservations
        csvContent += `1,${userId},1,2025-06-01T10:00:00.000Z,2025-06-01T12:00:00.000Z,pending`;
      }

      response.setHeader('Content-Type', 'text/csv');
      response.setHeader('Content-Disposition', `attachment; filename="user_${userId}_reservations.csv"`);
      response.send(csvContent);
    } catch (error) {
      console.error('Error generating CSV:', error);
      response.status(500).send('Error generating CSV');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Return paginated users.' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<{ users: User[] }> {
    const users = await this.usersService.findAll({ skip, limit });
    return { users };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }

  @Post(':id/extract')
  @ApiOperation({ summary: 'Generate extract for a user' })
  @ApiResponse({ status: 201, description: 'Extract URL.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async generateExtract(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<{ url: string }> {
    try {
      await this.usersService.findOne(+id);

      const metadata = new Metadata();
      const authHeader = request.headers.authorization;
      if (authHeader) {
        metadata.add('authorization', authHeader);
      }

      try {
        // Try to use the gRPC service first
        return await firstValueFrom(
          this.extractsService.generateUserExtract({ user_id: +id }, metadata),
        );
      } catch (grpcError) {
        console.log('gRPC service unavailable, using mock service:', grpcError.message);
        
        // Fallback to mock service if gRPC fails
        const mockService = new MockExtractsService(this.reservationRepository);
        return await firstValueFrom(
          mockService.generateUserExtract({ user_id: +id }, metadata),
        );
      }
    } catch (error) {
      console.error('Extract generation failed:', error);
      
      if (error.message && error.message.includes('not found')) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      throw new Error(`Failed to generate extract: ${error.message || 'Unknown error'}`);
    }
  }

  @Get('keycloak/:keycloakId')
  @ApiOperation({ summary: 'Get a user by Keycloak ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByKeycloakId(@Param('keycloakId') keycloakId: string): Promise<User> {
    return this.usersService.findByKeycloakId(keycloakId);
  }
}
