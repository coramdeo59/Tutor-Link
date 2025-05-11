import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTOs for Tutor module (create, update, response)

export class CreateTutorSubjectDto {
  @IsNumber()
  subjectId: number;

  @IsNumber()
  gradeId: number;
}

export class CreateTutorWorkExperienceDto {
  @IsString()
  workTitle: string;

  @IsString()
  workInstitution: string;

  @IsString()
  startDate: string | Date;

  @IsOptional()
  @IsString()
  endDate?: string | Date | null;
}

export class CreateTutorEducationDto {
  @IsString()
  major: string;

  @IsString()
  educationInstitution: string;

  @IsNumber()
  graduationYear: number;

  @IsNumber()
  educationTypeId: number;

  @IsOptional()
  @IsString()
  startDate?: string | Date | null;

  @IsOptional()
  @IsString()
  endDate?: string | Date | null;

  @IsOptional()
  @IsString()
  photo?: string;
}

export class CreateTutorIdDocumentDto {
  @IsString()
  photoFront: string;

  @IsString()
  photoBack: string;

  @IsString()
  countryName: string;

  @IsString()
  provinceName: string;

  @IsString()
  type: string;

  @IsString()
  documentNumber: string;
}

export class CreateTutorTeachingLicenseDto {
  @IsString()
  photo: string;

  @IsString()
  issueBody: string;

  @IsString()
  issuingCountryName: string;

  @IsString()
  issuerProvinceName: string;

  @IsString()
  certificationName: string;

  @IsNumber()
  subjectId: number;

  @IsNumber()
  gradeId: number;

  @IsString()
  issueDate: string | Date;

  @IsString()
  expirationDate: string | Date;
}

export class CreateTutorDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTutorSubjectDto)
  subjects?: CreateTutorSubjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTutorWorkExperienceDto)
  workExperiences?: CreateTutorWorkExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTutorEducationDto)
  educations?: CreateTutorEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTutorIdDocumentDto)
  idDocuments?: CreateTutorIdDocumentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTutorTeachingLicenseDto)
  teachingLicenses?: CreateTutorTeachingLicenseDto[];
}

// Update DTOs (all fields optional)
export class UpdateTutorSubjectDto {
  @IsOptional()
  @IsNumber()
  subjectId?: number;

  @IsOptional()
  @IsNumber()
  gradeId?: number;
}

export class UpdateTutorWorkExperienceDto {
  @IsOptional()
  @IsNumber()
  workExperienceId?: number;

  @IsOptional()
  @IsString()
  workTitle?: string;

  @IsOptional()
  @IsString()
  workInstitution?: string;

  @IsOptional()
  @IsString()
  startDate?: string | Date;

  @IsOptional()
  @IsString()
  endDate?: string | Date | null;
}

export class UpdateTutorEducationDto {
  @IsOptional()
  @IsNumber()
  educationId?: number;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  educationInstitution?: string;

  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @IsOptional()
  @IsNumber()
  educationTypeId?: number;

  @IsOptional()
  @IsString()
  startDate?: string | Date | null;

  @IsOptional()
  @IsString()
  endDate?: string | Date | null;

  @IsOptional()
  @IsString()
  photo?: string;
}

export class UpdateTutorIdDocumentDto {
  @IsOptional()
  @IsNumber()
  documentId?: number;

  @IsOptional()
  @IsString()
  photoFront?: string;

  @IsOptional()
  @IsString()
  photoBack?: string;

  @IsOptional()
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsString()
  provinceName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;
}

export class UpdateTutorTeachingLicenseDto {
  @IsOptional()
  @IsNumber()
  licenseId?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  issueBody?: string;

  @IsOptional()
  @IsString()
  issuingCountryName?: string;

  @IsOptional()
  @IsString()
  issuerProvinceName?: string;

  @IsOptional()
  @IsString()
  certificationName?: string;

  @IsOptional()
  @IsNumber()
  subjectId?: number;

  @IsOptional()
  @IsNumber()
  gradeId?: number;

  @IsOptional()
  @IsString()
  issueDate?: string | Date;

  @IsOptional()
  @IsString()
  expirationDate?: string | Date;
}

export class UpdateTutorDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTutorSubjectDto)
  subjects?: UpdateTutorSubjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTutorWorkExperienceDto)
  workExperiences?: UpdateTutorWorkExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTutorEducationDto)
  educations?: UpdateTutorEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTutorIdDocumentDto)
  idDocuments?: UpdateTutorIdDocumentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTutorTeachingLicenseDto)
  teachingLicenses?: UpdateTutorTeachingLicenseDto[];
}

// Response DTOs
export class TutorSubjectResponseDto {
  subjectId: number;
  gradeId: number;
}

export class TutorWorkExperienceResponseDto {
  workExperienceId: number;
  workTitle: string;
  workInstitution: string;
  startDate: string;
  endDate?: string | null;
}

export class TutorEducationResponseDto {
  educationId: number;
  major: string;
  educationInstitution: string;
  graduationYear: number;
  educationTypeId: number;
  startDate?: string | null;
  endDate?: string | null;
  photo?: string;
}

export class TutorIdDocumentResponseDto {
  documentId: number;
  photoFront: string;
  photoBack: string;
  countryName: string;
  provinceName: string;
  type: string;
  documentNumber: string;
}

export class TutorTeachingLicenseResponseDto {
  licenseId: number;
  photo: string;
  issueBody: string;
  issuingCountryName: string;
  issuerProvinceName: string;
  certificationName: string;
  subjectArea: string;
  gradeLevel: string;
  issueDate: string;
  expirationDate: string;
}

export class TutorResponseDto {
  tutorId: number;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  subjects?: TutorSubjectResponseDto[];
  workExperiences?: TutorWorkExperienceResponseDto[];
  educations?: TutorEducationResponseDto[];
  idDocuments?: TutorIdDocumentResponseDto[];
  teachingLicenses?: TutorTeachingLicenseResponseDto[];
}
