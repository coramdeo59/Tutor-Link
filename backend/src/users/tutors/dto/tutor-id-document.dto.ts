import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class TutorIdDocumentDto {
  @IsString()
  @IsNotEmpty()
  photoFront: string;

  @IsString()
  @IsNotEmpty()
  photoBack: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  countryId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  provinceId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;
}
