import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subdivision?: string;
}

export class CreateCountryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StateDto)
  states?: StateDto[];
}

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class CountryDto {
  CountryID: number;
  CountryName: string;
}
