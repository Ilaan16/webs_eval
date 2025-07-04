import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'Nom de la salle', example: 'Salle A101' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Capacité de la salle', example: 20, minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    description: 'Emplacement de la salle',
    example: 'Bâtiment A, 1er étage',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: 'Nom de la salle',
    example: 'Salle A101',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Capacité de la salle',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Emplacement de la salle',
    example: 'Bâtiment A, 1er étage',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
