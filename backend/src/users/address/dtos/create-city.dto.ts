import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCityDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  stateName: string;
}
