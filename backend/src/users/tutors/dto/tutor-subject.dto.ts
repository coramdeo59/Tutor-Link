import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class TutorSubjectDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  subjectId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  gradeId: number;
}
