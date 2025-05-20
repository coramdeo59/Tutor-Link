import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum FeedbackType {
  TUTOR_PERFORMANCE = 'tutor_performance',
  SESSION_FEEDBACK = 'session_feedback',
  GENERAL_FEEDBACK = 'general_feedback'
}

export class ProvideFeedbackDto {
  @IsNumber()
  @IsNotEmpty()
  tutorId: number;

  @IsNumber()
  @IsOptional()
  sessionId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(FeedbackType)
  @IsNotEmpty()
  feedbackType: FeedbackType;
}
