import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailabilitySlotDto {
  @IsString({ each: true })
  @IsNotEmpty()
  daysOfWeek: string[];

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;
}

export class UpdateAvailabilitySlotDto {
  @IsString()
  @IsOptional()
  dayOfWeek?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;
}

export class CreateUnavailableDateDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  reason?: string;
}
