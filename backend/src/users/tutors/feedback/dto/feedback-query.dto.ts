import { IsOptional, IsInt, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { feedbackTypes } from '../schema/feedback.schema';

export class FeedbackQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  childId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tutorId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subjectId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sessionId?: number;

  @IsOptional()
  @IsEnum(feedbackTypes)
  feedbackType?: typeof feedbackTypes[number];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
