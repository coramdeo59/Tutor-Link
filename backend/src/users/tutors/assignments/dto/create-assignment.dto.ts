import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  instructions: string;

  @IsNotEmpty()
  @IsInt()
  subjectId: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxScore: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedTimeMinutes?: number;

  @IsNotEmpty()
  @IsInt()
  childId: number; // The child to assign this to
}
