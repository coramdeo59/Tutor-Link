import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStateDto, StateResponseDto } from './create-state.dto';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStateDto)
  states: CreateStateDto[];
}

export class CountryResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StateResponseDto)
  states: StateResponseDto[];
}
