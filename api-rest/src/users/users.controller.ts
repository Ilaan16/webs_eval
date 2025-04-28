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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface ExtractsService {
  generateUserExtract(request: {
    user_id: number;
  }): Observable<{ url: string }>;
}

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(KeycloakAuthGuard)
@Controller('api/users')
export class UsersController implements OnModuleInit {
  private extractsService: ExtractsService;

  constructor(
    private readonly usersService: UsersService,
    @Inject('EXTRACTS_PACKAGE') private extractsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.extractsService =
      this.extractsClient.getService<ExtractsService>('Extracts');
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
  findAll(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    return this.usersService.findAll({ skip, limit });
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

  @Get('keycloak/:keycloakId')
  @ApiOperation({ summary: 'Get a user by Keycloak ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByKeycloakId(@Param('keycloakId') keycloakId: string): Promise<User> {
    return this.usersService.findByKeycloakId(keycloakId);
  }

  @Get(':id/extract')
  @ApiOperation({ summary: 'Generate a CSV extract of user reservations' })
  @ApiResponse({
    status: 200,
    description: 'Returns a URL to download the CSV file.',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://minio.example.com/reservations-csv/user_10_1678812345.csv',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async generateExtract(@Param('id') id: string) {
    // First verify the user exists
    await this.usersService.findOne(+id);

    // Call the gRPC service to generate the extract
    const response = await firstValueFrom(
      this.extractsService.generateUserExtract({ user_id: +id }),
    );

    return { url: response.url };
  }
}
