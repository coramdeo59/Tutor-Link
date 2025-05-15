import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTutorProfileDto {
  @ApiProperty({
    description: 'Tutor bio',
    maxLength: 5000,
    required: false,
    example: 'Experienced tutor with 5 years of teaching experience.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiProperty({
    description: 'ID of the subject the tutor can teach',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  subjectId?: number;

  @ApiProperty({
    description: 'ID of the grade level the tutor can teach',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  gradeId?: number;

  // isVerified is typically handled by an admin or a verification process,
  // so it might not be directly updatable by the tutor.
  // If it needs to be updatable via this DTO, uncomment the following:
  // @ApiProperty({
  //   description: 'Verification status of the tutor.',
  //   required: false,
  // })
  // @IsOptional()
  // @IsBoolean()
  // isVerified?: boolean;
}
