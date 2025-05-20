import { IsNotEmpty, IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { fileTypes } from '../schema/files.schema';

export class UploadFileDto {
  @IsNotEmpty()
  @IsInt()
  childId: number;

  @IsNotEmpty()
  @IsEnum(fileTypes)
  fileType: typeof fileTypes[number];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsInt()
  assignmentId?: number;

  @IsOptional()
  @IsInt()
  sessionId?: number;

  // Note: The actual file will be handled via multipart/form-data
  // and processed by the NestJS FileInterceptor, not through this DTO
}
