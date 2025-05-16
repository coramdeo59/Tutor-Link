import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Role } from 'src/users/enums/role-enums';

export enum UserType {
  TUTOR = 'tutor',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(Role)
  role: Role;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  stateId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  cityId: number;

  @IsString()
  @IsNotEmpty()
  // Consider using a more specific validator like @IsPhoneNumber if available
  // or a regex pattern for phone number validation.
  // For simplicity, using IsString and IsNotEmpty for now.
  phoneNumber: string;
}
