import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  AddressLine1: string;

  @IsOptional()
  @IsString()
  AddressLine2?: string;

  @IsNumber()
  CountryID: number;

  @IsNumber()
  ProvinceID: number;

  @IsString()
  City: string;

  @IsString()
  Phone: string;

  @IsString()
  ZipCode: string;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  AddressLine1?: string;

  @IsOptional()
  @IsString()
  AddressLine2?: string;

  @IsOptional()
  @IsNumber()
  CountryID?: number;

  @IsOptional()
  @IsNumber()
  ProvinceID?: number;

  @IsOptional()
  @IsString()
  City?: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @IsString()
  ZipCode?: string;
}

export class AddressDto {
  AddressID: number;

  @IsString()
  AddressLine1: string;

  @IsOptional()
  @IsString()
  AddressLine2?: string;

  @IsNumber()
  CountryID: number;

  @IsNumber()
  ProvinceID: number;

  @IsString()
  City: string;

  @IsString()
  Phone: string;

  @IsString()
  ZipCode: string;
}
