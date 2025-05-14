import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  Length,
  IsAlphanumeric,
} from 'class-validator';

export class CreateChildDto {
  @IsNotEmpty()
  @IsInt()
  parentId: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric() // Ensure username is alphanumeric
  @Length(3, 30) // Define appropriate length for username
  username: string; // Added username

  @IsNotEmpty()
  @IsString()
  @Length(8, 100) // Define appropriate length for password
  password: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  gradeLevelId?: number;
}
