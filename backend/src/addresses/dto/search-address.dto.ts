import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchAddressDto {
  @IsOptional()
  @IsUUID()
  user_uuid?: string;

  @IsOptional()
  @IsUUID()
  sensor_uuid?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  search?: string; // General search across street, city, state, country
}