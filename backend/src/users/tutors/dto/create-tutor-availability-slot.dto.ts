import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMilitaryTime, ValidateIf } from 'class-validator';

export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export class CreateTutorAvailabilitySlotDto {
  @ApiProperty({
    enum: DayOfWeek,
    isArray: true,
    example: ['Monday', 'Wednesday', 'Friday'],
    description: 'One or more days of the week',
  })
  @ValidateIf((o) => Array.isArray(o.dayOfWeek))
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  @ValidateIf((o) => !Array.isArray(o.dayOfWeek))
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek | DayOfWeek[];

  @ApiProperty({ example: '09:00:00' })
  @IsMilitaryTime()
  startTime: string;

  @ApiProperty({ example: '17:00:00' })
  @IsMilitaryTime()
  endTime: string;
}
