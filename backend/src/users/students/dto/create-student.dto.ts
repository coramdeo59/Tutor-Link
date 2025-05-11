import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  gradeLevelName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjectNames?: string[];
}
