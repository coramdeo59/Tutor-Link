import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';


export class UpdateSessionDto {
  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
} 