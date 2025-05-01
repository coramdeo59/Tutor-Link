import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../users/enums/role-enums';

export class SignUpDto {
  @IsString()
  FirstName: string;
  @IsString()
  LastName: string;
  @IsEmail()
  email: string;
  @MinLength(10)
  password: string;
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either "regular" or "admin"' })
  role?: Role;
}
