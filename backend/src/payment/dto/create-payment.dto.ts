import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MaxLength, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @IsIn(['ETB', 'USD'], { message: 'Currency must be either ETB or USD' })
  currency: string = 'ETB';

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { 
    message: 'Please provide a valid email address',
  })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phoneNumber?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Invoice ID must be a number' })
  invoiceId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tutoring Session ID must be a number' })
  tutoringSessionId?: number;
}