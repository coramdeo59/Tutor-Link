import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsUUID(4, { message: 'Token must be a valid UUID v4' })
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}
