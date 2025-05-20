import { Type } from 'class-transformer';
import { IsInt, IsString, IsNumber, IsArray, IsDate, IsOptional, Min, Max, ValidateNested } from 'class-validator';

/**
 * DTO for representing a subject progress item
 */
export class SubjectProgressDto {
  @IsInt()
  subjectId: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsInt()
  sessionCount: number;

  @IsNumber()
  hoursSpent: number;
}

/**
 * DTO for representing a child's overall progress
 */
export class ChildProgressDto {
  @IsInt()
  childId: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  overallProgress: number;

  @IsInt()
  totalSessions: number;

  @IsNumber()
  totalHours: number;

  @IsInt()
  upcomingSessions: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectProgressDto)
  subjectProgress: SubjectProgressDto[];
}

/**
 * DTO for an assessment item in a subject's detail view
 */
export class AssessmentDto {
  @IsInt()
  assessmentId: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsDate()
  date: Date;

  @IsString()
  tutorName: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for a subject's detailed progress information
 */
export class SubjectDetailDto {
  @IsInt()
  childId: number;

  @IsInt()
  subjectId: number;

  @IsString()
  subjectName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsInt()
  sessionCount: number;

  @IsNumber()
  totalHoursSpent: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentDto)
  recentAssessments: AssessmentDto[];
}
