import { IsInt, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for creating a progress assessment
 */
export class CreateProgressAssessmentDto {
  @IsInt()
  sessionId: number;

  @IsInt()
  subjectId: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @IsString()
  @IsOptional()
  tutorNotes?: string;
}

/**
 * DTO for assessment response
 */
export class AssessmentDto {
  assessmentId: number;
  sessionId: number;
  childId: number;
  subjectId: number;
  subjectName: string;
  progressPercentage: number;
  assessmentDate: Date;
  tutorNotes?: string;
}

/**
 * DTO for assessment listing
 */
export class AssessmentListItemDto {
  assessmentId: number;
  score: number; // This is the same as progressPercentage but renamed for frontend
  date: Date; // This is assessmentDate renamed for frontend simplicity
  tutorName: string; // This is derived from tutor information
  notes?: string; // From tutorNotes
}
