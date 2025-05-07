import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorDto } from './create-tutor.dto';

export class UpdateTutorDto extends PartialType(CreateTutorDto) {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  BirthDate?: string;
  Certified?: boolean;
  Major?: string;
  EducationInstitution?: string;
  GraduationYear?: number;
  WorkTitle?: string;
  WorkInstitution?: string;
}
