import { IsOptional, MaxLength } from 'class-validator';

export class CreateVerificationDetailsDto {

  @IsOptional()
  @MaxLength(255)
  documentUpload?: string;


  @IsOptional()
  @MaxLength(255)
  cvUpload?: string;

  @IsOptional()
  @MaxLength(255)
  kebeleIdUpload?: string;

  @IsOptional()
  @MaxLength(255)
  nationalIdUpload?: string;

  @IsOptional()
  @MaxLength(100)
  fanNumber?: string;
}
