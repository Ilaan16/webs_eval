import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../dto/rooms.dto';
import {KeycloakAuthGuard} from "../auth/keycloak-auth.guard";

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(KeycloakAuthGuard)
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of rooms' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of rooms returned' })
  async findAll(@Query('skip') skip?: number, @Query('limit') limit?: number) {
    return this.roomsService.findAll({ skip, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific room' })
  @ApiResponse({ status: 200, description: 'Room details returned' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findOne(@Param('id') id: number) {
    return this.roomsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room successfully created' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing room' })
  @ApiResponse({ status: 200, description: 'Room successfully updated' })
  async update(@Param('id') id: number, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 204, description: 'Room successfully deleted' })
  async remove(@Param('id') id: number) {
    return this.roomsService.remove(id);
  }
}
