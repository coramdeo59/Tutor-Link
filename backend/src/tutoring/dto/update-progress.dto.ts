import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @IsOptional()
  @IsNumber()
  sessionId?: number;
}
