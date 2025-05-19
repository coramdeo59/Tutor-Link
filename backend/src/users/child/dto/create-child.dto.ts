import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, MinLength, MaxLength, IsAlphanumeric } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(100)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  photo?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsNumber()
  @IsOptional()
  gradeLevelId?: number;
}
