import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class TutorTeachingLicenseDto {
  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsString()
  @IsNotEmpty()
  issueBody: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  issuingCountryId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  issuerProvinceId: number;

  @IsString()
  @IsNotEmpty()
  subtype: string;

  @IsString()
  @IsNotEmpty()
  certificationName: string;

  @IsString()
  @IsNotEmpty()
  subjectArea: string;

  @IsString()
  @IsNotEmpty()
  gradeLevel: string;

  @IsDateString()
  @IsNotEmpty()
  issueDate: Date;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;
}
