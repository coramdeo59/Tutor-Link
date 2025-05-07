import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class TutorEducationDto {
  @IsString()
  @IsNotEmpty()
  major: string;

  @IsString()
  @IsNotEmpty()
  educationInstitution: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 20) // Allow future graduation dates up to 20 years
  @IsNotEmpty()
  graduationYear: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  educationTypeId: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  photo?: string;
}
