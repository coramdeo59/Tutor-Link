import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class QuickAssignmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsInt()
  childId: number; // Student to assign this to

  @IsNotEmpty()
  @IsInt()
  subjectId: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
