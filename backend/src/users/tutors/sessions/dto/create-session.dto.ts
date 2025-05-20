import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { sessionStatus } from '../schema/sessions.schema';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsInt()
  childId: number;

  @IsNotEmpty()
  @IsInt()
  subjectId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsEnum(sessionStatus)
  status: typeof sessionStatus[number] = 'scheduled';

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationMinutes: number;
}
