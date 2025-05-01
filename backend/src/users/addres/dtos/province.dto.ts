import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProvinceDto {
  @IsNumber()
  CountryID: number;

  @IsString()
  ProvinceName: string;
}

export class UpdateProvinceDto {
  @IsOptional()
  @IsNumber()
  CountryID?: number;

  @IsOptional()
  @IsString()
  ProvinceName?: string;
}

export class ProvinceDto {
  ProvinceID: number;
  CountryID: number;
  ProvinceName: string;
}
