import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID de la réservation associée', example: 1 })
  @IsNotEmpty()
  @IsInt()
  reservation_id: number;

  @ApiProperty({
    description: 'Message de la notification',
    example: 'Votre réservation a été approuvée',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Date de la notification',
    example: '2023-03-18T10:00:00Z',
  })
  @IsNotEmpty()
  notification_date: Date;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Message de la notification',
    example: 'Votre réservation a été approuvée',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: "État d'envoi de la notification",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_sent?: boolean;
}
