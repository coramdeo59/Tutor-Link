import { SignUpDto } from './sign-up.dto';
import { IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/roles-type-enum';


export class AdminSignUpDto extends SignUpDto {

  role: Role = Role.ADMIN;
  

  @IsOptional()
  @IsString()
  phoneNumber?: string;
} 