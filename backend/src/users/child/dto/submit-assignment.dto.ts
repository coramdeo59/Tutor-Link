import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class SubmitAssignmentDto {
  @IsNumber()
  @IsNotEmpty()
  assignmentId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}
