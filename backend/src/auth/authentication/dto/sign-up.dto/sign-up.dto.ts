import { IsEmail, IsString, MinLength } from 'class-validator';
export class SignUpDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @MinLength(10)
  password: string;
}
