import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsISO8601, IsOptional } from 'class-validator';

@InputType()
export class CreateReservationDto {
  @Field(() => ID)
  @IsNotEmpty()
  user_id: string;

  @Field(() => ID)
  @IsNotEmpty()
  room_id: string;

  @Field()
  @IsNotEmpty()
  @IsISO8601()
  start_time: string;

  @Field()
  @IsNotEmpty()
  @IsISO8601()
  end_time: string;
}

@InputType()
export class UpdateReservationDto {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  start_time?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISO8601()
  end_time?: string;
}
