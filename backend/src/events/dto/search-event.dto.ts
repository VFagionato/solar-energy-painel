import { IsOptional, IsUUID, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchEventDto {
  @IsOptional()
  @IsUUID()
  sensor_uuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_power_generated?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_power_generated?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_heat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_heat?: number;
}