import {
  IsNotEmpty,
  IsInt,
  IsISO8601,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: "ID de l'utilisateur", example: 1 })
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @ApiProperty({ description: 'ID de la salle', example: 1 })
  @IsNotEmpty()
  @IsInt()
  room_id: number;

  @ApiProperty({
    description: 'Date et heure de début (format ISO)',
    example: '2023-03-18T10:00:00Z',
  })
  @IsNotEmpty()
  @IsISO8601()
  start_time: string;

  @ApiProperty({
    description: 'Date et heure de fin (format ISO)',
    example: '2023-03-18T12:00:00Z',
  })
  @IsNotEmpty()
  @IsISO8601()
  end_time: string;

  @ApiPropertyOptional({
    description: 'Statut de la réservation',
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    example: 'pending',
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'cancelled'])
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export class UpdateReservationDto {
  @ApiPropertyOptional({ description: "ID de l'utilisateur", example: 1 })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiPropertyOptional({ description: 'ID de la salle', example: 1 })
  @IsOptional()
  @IsInt()
  room_id?: number;

  @ApiPropertyOptional({
    description: 'Date et heure de début (format ISO)',
    example: '2023-03-18T10:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Date et heure de fin (format ISO)',
    example: '2023-03-18T12:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Statut de la réservation',
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    example: 'approved',
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'cancelled'])
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}
