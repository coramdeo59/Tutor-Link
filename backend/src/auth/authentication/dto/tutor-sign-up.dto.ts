import { SignUpDto } from './sign-up.dto';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../enums/roles-type-enum';

// DTO for availability slot
export class AvailabilitySlotDto {
  @IsString()
  dayOfWeek: string;
  
  @IsDateString()
  startTime: string;
  
  @IsDateString()
  endTime: string;
}


export class TutorSignUpDto extends SignUpDto {
 
  role: Role = Role.TUTOR;
  

  @IsOptional()
  @IsString()
  bio?: string;
  
 
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;
  
 
  @IsOptional()
  @IsNumber()
  rating?: number;
  

  @IsOptional()
  @IsNumber()
  reviewCount?: number;
  

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
  

  @IsOptional()
  @IsString()
  street?: string;
  
 
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
  

  @IsOptional()
  @IsString()
  country?: string;
  
  
  @IsOptional()
  @IsString()
  photo?: string;

  // Verification fields
  @IsOptional()
  @IsString()
  fanNumber?: string;

  @IsOptional()
  @IsString()
  idDocumentUrl?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  graduationYear?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean()
  hasTeachingCertificate?: boolean;

  @IsOptional()
  @IsString()
  certificateUrl?: string;

  // Subject fields
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  // Availability fields
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilitySlots?: AvailabilitySlotDto[];
  
  // Grade levels fields
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeLevels?: string[];
}