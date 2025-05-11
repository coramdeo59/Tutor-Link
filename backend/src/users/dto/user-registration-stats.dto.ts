import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum GroupByPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class UserRegistrationStatsDto {
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;

  @IsOptional()
  @IsEnum(GroupByPeriod, {
    message: 'Group by must be one of: day, week, month, year',
  })
  groupBy?: GroupByPeriod = GroupByPeriod.DAY;
}
