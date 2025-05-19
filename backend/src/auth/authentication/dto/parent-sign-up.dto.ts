import { SignUpDto } from './sign-up.dto';
import { IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/roles-type-enum';


export class ParentSignUpDto extends SignUpDto {
 

  role: Role = Role.PARENT;
  

  @IsOptional()
  @IsString()
  city?: string;
  

  @IsOptional()
  @IsString()
  state?: string;
  

  @IsOptional()
  @IsString()
  photo?: string;
  

  @IsOptional()
  @IsString()
  preferredSubjects?: string;
  

  @IsOptional()
  @IsString()
  preferred_communication?: string;
} 