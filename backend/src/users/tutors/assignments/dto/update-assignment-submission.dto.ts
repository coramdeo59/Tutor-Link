import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { submissionStatus } from '../schema/assignments.schema';

export class UpdateAssignmentSubmissionDto {
  @IsOptional()
  @IsEnum(submissionStatus)
  status?: typeof submissionStatus[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  submissionText?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
