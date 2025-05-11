import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsInt()
  stateId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsInt()
  countryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;
}
