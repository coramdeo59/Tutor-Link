import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { sessionStatus } from '../schema/sessions.schema';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(sessionStatus)
  status?: typeof sessionStatus[number];

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
