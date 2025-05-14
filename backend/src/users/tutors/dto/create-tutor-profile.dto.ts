import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTutorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;
}
