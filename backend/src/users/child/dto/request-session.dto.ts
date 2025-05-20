import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class RequestSessionDto {
  @IsNumber()
  @IsNotEmpty()
  tutorId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsDateString()
  @IsNotEmpty()
  requestedStartTime: string;

  @IsDateString()
  @IsNotEmpty()
  requestedEndTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
