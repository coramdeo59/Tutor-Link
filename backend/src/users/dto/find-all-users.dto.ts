import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { userTypeEnum } from '../schema';
import { Role } from '../enums/role-enums';

export class FindAllUsersDto {
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
  @IsEnum(userTypeEnum.enumValues, {
    message: 'User type must be tutor, student, or parent',
  })
  userType?: (typeof userTypeEnum.enumValues)[number];

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either "regular" or "admin"' })
  role?: Role;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt({ message: 'Country ID must be an integer' })
  @Type(() => Number)
  countryId?: number;

  @IsOptional()
  @IsInt({ message: 'State ID must be an integer' })
  @Type(() => Number)
  stateId?: number;
}
