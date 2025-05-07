import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role-enums';
import { userTypeEnum } from '../schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  FirstName: string;

  @IsString()
  @IsNotEmpty()
  LastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(10)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(userTypeEnum.enumValues, {
    message: 'UserType must be tutor, student, or parent',
  })
  UserType: (typeof userTypeEnum.enumValues)[number];

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either "regular" or "admin"' })
  role?: Role;

  // Assuming AddressID might be handled differently or defaulted
  // addressId?: number;
}
