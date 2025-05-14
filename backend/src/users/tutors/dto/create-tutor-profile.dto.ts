import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTutorProfileDto {
  @ApiProperty({
    description: 'Tutor bio',
    maxLength: 5000,
    required: false,
    example: 'Experienced tutor with 5 years of teaching experience.'
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiProperty({
    description: 'ID of the subject the tutor can teach',
    required: true,
    example: 1
  })
  @IsNumber()
  subjectId: number;

  @ApiProperty({
    description: 'ID of the grade level the tutor can teach',
    required: true,
    example: 1
  })
  @IsNumber()
  gradeId: number;
}
