import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Role } from '../enums/role-enums';
import { userTypeEnum } from '../schema';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @MinLength(10)
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsEnum(userTypeEnum.enumValues, {
    message: 'UserType must be tutor, student, or parent',
  })
  userType?: (typeof userTypeEnum.enumValues)[number];

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either "regular" or "admin"' })
  role?: Role;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'Photo must be a valid URL' })
  @ValidateIf((o) => o.photo !== null)
  photo?: string | null;

  @Type(() => Number)
  addressId?: number;
}
