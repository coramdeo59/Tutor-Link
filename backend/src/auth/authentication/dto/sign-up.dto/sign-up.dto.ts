import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested, // Import ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer'; // Import Type
import { CreateAddressDto } from '../../../../users/address/dtos/create-address.dto'; // Import CreateAddressDto
import { Role } from '../../../../users/enums/role-enums'; // Import Role enum

export enum UserType {
  TUTOR = 'tutor',
  STUDENT = 'student',
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

  @ValidateNested() // Add validation for nested DTO
  @Type(() => CreateAddressDto) // Specify the type for transformation
  address: CreateAddressDto; // Change from addressId to address

  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(Role) // Add validation for the role enum
  @IsNotEmpty()
  role: Role; // Change type from string to Role enum
}
