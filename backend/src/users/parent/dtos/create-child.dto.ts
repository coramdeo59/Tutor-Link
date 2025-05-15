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
  @IsOptional() // Make optional for validation
  @IsInt()
  parentId!: number;

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
  @IsAlphanumeric()
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
