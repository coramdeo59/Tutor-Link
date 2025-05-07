import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class TutorWorkExperienceDto {
  @IsString()
  @IsNotEmpty()
  workTitle: string;

  @IsString()
  @IsNotEmpty()
  workInstitution: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
