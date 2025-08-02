import { IsString, IsNotEmpty, IsOptional, IsUUID, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  document: string;

  @IsOptional()
  @IsUUID()
  address_uuid?: string;
}