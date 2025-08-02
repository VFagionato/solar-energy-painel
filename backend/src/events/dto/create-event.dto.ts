import { IsUUID, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateEventDto {
  @IsUUID()
  @IsNotEmpty()
  sensor_uuid: string;

  @IsNumber()
  @Min(0)
  power_generated: number;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  @Min(0)
  heat: number;
}