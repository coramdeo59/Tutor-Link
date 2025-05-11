import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MatchingQueryDto {
  @IsOptional()
  @IsInt({ message: 'Page number must be an integer' })
  @Min(1, { message: 'Page number must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsInt({ message: 'Subject ID must be an integer' })
  @Type(() => Number)
  subjectId?: number;

  @IsOptional()
  @IsInt({ message: 'Grade level ID must be an integer' })
  @Type(() => Number)
  gradeLevelId?: number;

  @IsOptional()
  @IsInt({ message: 'Country ID must be an integer' })
  @Type(() => Number)
  countryId?: number;

  @IsOptional()
  @IsInt({ message: 'State ID must be an integer' })
  @Type(() => Number)
  stateId?: number;
}
