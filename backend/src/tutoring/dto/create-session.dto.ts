import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @IsNumber()
  @IsOptional()
  childId?: number; // Made optional - will be set from ActiveUser if not provided

  @IsNumber()
  @IsNotEmpty()
  tutorId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional() // Made optional for immediate sessions
  startTime?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional() // Made optional for open-ended sessions
  endTime?: Date;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsBoolean()
  @IsOptional()
  cancelled?: boolean;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  // Flag to indicate if this is an immediate session (starts now)
  @IsBoolean()
  @IsOptional()
  isImmediate?: boolean;

  // Estimated duration in minutes (for immediate sessions)
  @IsNumber()
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  skipAvailabilityCheck?: boolean;
}
