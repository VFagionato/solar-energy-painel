import { IsOptional, IsString, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSensorDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsUUID()
  equip_address_uuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_total_events?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_total_events?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(360)
  min_angle?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(360)
  max_angle?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_power_generate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_power_generate?: number;

  @IsOptional()
  @IsString()
  search?: string; // General search across code
}