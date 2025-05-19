import { 
  IsString, 
  IsNotEmpty, 
  IsDate, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '../schema/scheduler.schema';

export class CreateSessionDto {
  @IsNumber({}, { message: 'Tutor ID must be a valid number' })
  @IsNotEmpty({ message: 'Tutor ID is required' })
  tutorId: number;

  @IsNumber({}, { message: 'Child ID must be a valid number' })
  @IsNotEmpty({ message: 'Child ID is required' })
  childId: number;

  @IsNumber({}, { message: 'Subject ID must be a valid number when provided' })
  @IsOptional()
  subjectId?: number;

  @IsString({ message: 'Subject name must be a string' })
  @IsNotEmpty({ message: 'Subject name is required' })
  subjectName: string;

  @IsNumber({}, { message: 'Grade level ID must be a valid number when provided' })
  @IsOptional()
  gradeLevelId?: number;

  @IsString({ message: 'Grade level name must be a string' })
  @IsOptional()
  gradeLevelName?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;

  @IsNumber()
  @IsNotEmpty()
  @Min(15)
  @Max(180)
  durationMinutes: number;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0, { message: 'Amount cannot be negative' })
  @IsNotEmpty({ message: 'Session amount is required' })
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSessionDto {
  @IsNumber()
  @IsOptional()
  tutorId?: number;

  @IsNumber()
  @IsOptional()
  childId?: number;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsString()
  @IsOptional()
  subjectName?: string;

  @IsNumber()
  @IsOptional()
  gradeLevelId?: number;

  @IsString()
  @IsOptional()
  gradeLevelName?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;

  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  zoomLink?: string;
}

export class CancelSessionDto {
  @IsEnum(SessionStatus)
  @IsNotEmpty()
  status: SessionStatus.CANCELLED;

  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
