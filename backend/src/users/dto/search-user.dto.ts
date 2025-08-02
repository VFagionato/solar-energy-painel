import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsUUID()
  address_uuid?: string;

  @IsOptional()
  @IsString()
  search?: string; // General search across name, last_name, and document
}