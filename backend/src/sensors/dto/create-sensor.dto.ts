import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, Length, Min, Max } from 'class-validator';

export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @IsUUID()
  @IsNotEmpty()
  equip_address_uuid: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_events?: number = 0;

  @IsNumber()
  @Min(0)
  @Max(360)
  angle: number;

  @IsNumber()
  @Min(0)
  power_generate: number;

  @IsOptional()
  last_shutdown?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_shutdown?: number = 0;
}