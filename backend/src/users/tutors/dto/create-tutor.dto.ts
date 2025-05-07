import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTutorDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsOptional()
  bio: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  hourlyRate: number;

  BirthDate: string;
  Certified: boolean;
  Major: string;
  EducationInstitution: string;
  GraduationYear: number;
  WorkTitle: string;
  WorkInstitution: string;
}
