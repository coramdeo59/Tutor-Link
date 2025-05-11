import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGradeLevelDto {
  @IsString()
  @IsNotEmpty()
  gradeLevel: string;
}
