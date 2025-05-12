import { IsOptional, IsString } from 'class-validator';

export class SearchAddressQueryDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  street?: string;
}
