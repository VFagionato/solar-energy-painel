import { IsString, IsNotEmpty, IsOptional, IsUUID, Length } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsUUID()
  user_uuid?: string;

  @IsOptional()
  @IsUUID()
  sensor_uuid?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  street: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  number: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  state: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  zipcode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  country: string;
}