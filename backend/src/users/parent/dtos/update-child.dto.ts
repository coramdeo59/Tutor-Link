import { IsOptional, IsString, IsInt, MaxLength, MinLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChildInfoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  gradeLevelId?: number;
}

export class UpdateChildCredentialsDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;
}

export class ChildSessionsQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  childId?: number;

  @IsOptional()
  @Type(() => Boolean)
  upcoming?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
} 