// student DTOs
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Associated user ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Grade level ID' })
  @IsInt()
  gradeLevelId: number;

  @ApiProperty({ description: 'School name', required: false })
  @IsString()
  @IsOptional()
  schoolName?: string;

  @ApiProperty({ description: 'Enrollment date' })
  @IsDateString()
  enrollmentDate: Date;

  @ApiProperty({ description: 'Expected graduation year' })
  @IsInt()
  graduationYear: number;
}

export class StudentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  gradeLevel: number;

  @ApiProperty()
  schoolName?: string;

  @ApiProperty()
  enrollmentDate: Date;

  @ApiProperty()
  graduationYear: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
