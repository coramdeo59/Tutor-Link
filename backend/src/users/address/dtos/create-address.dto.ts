import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  countryName: string; // Changed from countryId: number

  @IsString()
  @IsOptional()
  stateName?: string; // Changed from stateId?: number

  @IsString()
  @IsOptional()
  cityName?: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
