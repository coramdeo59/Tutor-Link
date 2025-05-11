import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested, // Import ValidateNested
} from 'class-validator';
import { Role } from '../enums/role-enums';
import { userTypeEnum } from '../schema';
import { Type } from 'class-transformer'; // Import Type
import { CreateStudentDto } from '../students/dto/create-student.dto'; // Import CreateStudentDto

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

  @IsOptional()
  @ValidateNested() // Add ValidateNested decorator
  @Type(() => CreateStudentDto) // Add Type decorator
  studentData?: CreateStudentDto; // Add studentData field

  // Assuming AddressID might be handled differently or defaulted
  // addressId?: number;
}
