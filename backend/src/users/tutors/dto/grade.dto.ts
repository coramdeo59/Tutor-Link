import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class AddGradeDto {
  @IsNotEmpty()
  @IsString()
  gradeLevelName: string;
}

export class AddGradesDto {
  @IsArray()
  @IsNotEmpty()
  grades: AddGradeDto[];
}

export class GetGradesResponseDto {
  id: number;
  tutorId: number;
  gradeLevel: string;
  gradeLevelId?: number;
  createdAt: Date;
}