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
  HttpStatus,
  // UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  // ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from '../dto/reservations.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('reservations')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of reservations' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of reservations returned' })
  async findAll(@Query('skip') skip?: number, @Query('limit') limit?: number) {
    return this.reservationsService.findAll({ skip, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific reservation' })
  @ApiResponse({ status: 200, description: 'Reservation details returned' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async findOne(@Param('id') id: number) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing reservation' })
  @ApiResponse({ status: 200, description: 'Reservation successfully updated' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async update(
    @Param('id') id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiResponse({ status: 204, description: 'Reservation successfully deleted' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async remove(@Param('id') id: number) {
    return this.reservationsService.remove(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reservations for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of user reservations returned',
  })
  async findByUserId(@Param('userId') userId: number) {
    return this.reservationsService.findByUserId(userId);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get all reservations for a specific room' })
  @ApiResponse({
    status: 200,
    description: 'List of room reservations returned',
  })
  async findByRoomId(@Param('roomId') roomId: number) {
    return this.reservationsService.findByRoomId(roomId);
  }
}
