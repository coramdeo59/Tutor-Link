import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';


export class TutorVerificationDto {

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
} 