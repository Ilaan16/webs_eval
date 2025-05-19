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
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, of } from 'rxjs';
import { Response } from 'express';

interface ExtractsService {
  generateUserExtract(request: { user_id: number }): Observable<{ url: string }>;
}

// Mock service for testing
class MockExtractsService implements ExtractsService {
  generateUserExtract(request: { user_id: number }): Observable<{ url: string }> {
    return of({ url: 'will-be-overwritten-in-onModuleInit' });
  }
}

@ApiTags('users')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController implements OnModuleInit {
  private extractsService: ExtractsService;

  constructor(
    private readonly usersService: UsersService,
    @Optional() @Inject('EXTRACTS_PACKAGE') private extractsClient?: ClientGrpc,
  ) {}

  onModuleInit() {
    if (this.extractsClient) {
      this.extractsService =
        this.extractsClient.getService<ExtractsService>('Extracts');
    } else {
      this.extractsService = new MockExtractsService();
      (this.extractsService as MockExtractsService).generateUserExtract = (
        request: { user_id: number },
      ) => {
        const port = process.env.PORT || 3000;
        return of({
          url: `http://localhost:${port}/api/users/mock-extract-data/dynamic-data.csv?userId=${request.user_id}`,
        });
      };
    }
  }

  @Get('mock-extract-data/dynamic-data.csv')
  @ApiExcludeEndpoint()
  getDynamicMockExtract(@Res() response: Response, @Query('userId') userIdQuery?: string) {
    const header = "reservationId,userId,roomId,startTime,endTime,status\n";
    const userIdForCsv = userIdQuery || '1';
    
    const csvDataRow = `1,${userIdForCsv},1,2025-06-01T10:00:00.000Z,2025-06-01T12:00:00.000Z,approved\n`;
    const csvContent = header + csvDataRow;

    response.setHeader('Content-Type', 'text/csv');
    response.send(csvContent);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }

  @Post(':id/extract')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate extract for a user' })
  @ApiResponse({ status: 200, description: 'Extract URL.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async generateExtract(@Param('id') id: string): Promise<{ url: string }> {
    await this.usersService.findOne(+id);
    return firstValueFrom(
      this.extractsService.generateUserExtract({ user_id: +id }),
    );
  }

  @Get('keycloak/:keycloakId')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a user by Keycloak ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByKeycloakId(@Param('keycloakId') keycloakId: string): Promise<User> {
    return this.usersService.findByKeycloakId(keycloakId);
  }
}
