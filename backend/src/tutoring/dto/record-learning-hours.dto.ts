import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class RecordLearningHoursDto {
  @IsInt()
  childId: number;

  @IsInt()
  subjectId: number;

  @IsNumber()
  @Min(0.25) // Minimum 15 minutes (0.25 hours)
  @Max(24) // Maximum 24 hours in a day
  hoursSpent: number;

  @IsOptional()
  @IsInt()
  sessionId?: number;

  @IsOptional()
  description?: string;
}
