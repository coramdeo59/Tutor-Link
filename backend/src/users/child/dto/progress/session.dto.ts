import { IsInt, IsString, IsDate, IsEnum, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * DTO for representing an upcoming session
 */
export class UpcomingSessionDto {
  @IsInt()
  sessionId: number;

  @IsString()
  subject: string;

  @IsString()
  tutorName: string;

  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsInt()
  durationMinutes: number;
}

/**
 * DTO for representing a list of upcoming sessions
 */
export class UpcomingSessionsDto {
  @IsInt()
  childId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpcomingSessionDto)
  upcomingSessions: UpcomingSessionDto[];
}

/**
 * DTO for representing a session in history
 */
export class SessionHistoryItemDto {
  @IsInt()
  sessionId: number;

  @IsString()
  subject: string;

  @IsString()
  tutorName: string;

  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsInt()
  durationMinutes: number;

  @IsEnum(SessionStatus)
  status: SessionStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for representing a paginated list of session history
 */
export class SessionHistoryDto {
  @IsInt()
  childId: number;

  @IsInt()
  totalSessions: number;

  @IsInt()
  totalPages: number;

  @IsInt()
  @Min(1)
  currentPage: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionHistoryItemDto)
  sessions: SessionHistoryItemDto[];
}

/**
 * DTO for querying session history
 */
export class SessionQueryDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1)
  pageSize?: number = 10;

  @IsInt()
  @IsOptional()
  subjectId?: number;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;
}
