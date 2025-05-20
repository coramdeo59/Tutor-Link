import { IsNotEmpty, IsString, IsInt, IsOptional, IsEnum, IsBoolean, Min, Max, IsArray } from 'class-validator';
import { feedbackTypes } from '../schema/feedback.schema';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(feedbackTypes)
  feedbackType: typeof feedbackTypes[number];

  @IsNotEmpty()
  @IsInt()
  childId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  sessionId?: number;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsInt()
  assignmentId?: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsArray()
  attachmentIds?: string[];
}
