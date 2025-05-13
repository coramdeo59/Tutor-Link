import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/users/address/dtos/address.dto';
import { Role } from 'src/users/enums/role-enums';


export enum UserType {
  TUTOR = 'tutor',
  PARENT = 'parent',
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

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
