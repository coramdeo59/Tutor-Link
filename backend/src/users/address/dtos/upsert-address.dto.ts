import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpsertAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  location: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  street?: string;
}
