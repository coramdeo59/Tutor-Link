import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Address line 1 is required' })
  @MaxLength(255, { message: 'Address line 1 must not exceed 255 characters' })
  addressLine1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Address line 2 must not exceed 255 characters' })
  addressLine2?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @IsInt({ message: 'State ID must be an integer' })
  @IsOptional()
  @Type(() => Number)
  stateId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  postalCode?: string;

  @IsInt({ message: 'Country ID must be an integer' })
  @IsOptional()
  @Type(() => Number)
  countryId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Phone number must not exceed 50 characters' })
  phoneNumber?: string;
}
