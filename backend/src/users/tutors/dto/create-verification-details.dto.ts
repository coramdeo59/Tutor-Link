import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificationDetailsDto {
  @ApiProperty({
    description: 'URL to the document for verification (e.g., educational certificate, transcript).',
    required: false,
    maxLength: 255,
    example: 'https://example.com/docs/document.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Document upload must be a valid URL.' })
  @MaxLength(255)
  documentUpload?: string;

  @ApiProperty({
    description: 'URL to the CV/Resume.',
    required: false,
    maxLength: 255,
    example: 'https://example.com/docs/cv.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'CV upload must be a valid URL.' })
  @MaxLength(255)
  cvUpload?: string;

  @ApiProperty({
    description: 'URL to the Kebele ID card.',
    required: false,
    maxLength: 255,
    example: 'https://example.com/docs/kebele_id.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Kebele ID upload must be a valid URL.' })
  @MaxLength(255)
  kebeleIdUpload?: string;

  @ApiProperty({
    description: 'URL to the National ID card.',
    required: false,
    maxLength: 255,
    example: 'https://example.com/docs/national_id.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'National ID upload must be a valid URL.' })
  @MaxLength(255)
  nationalIdUpload?: string;

  @ApiProperty({
    description: 'FAN (File A Number) or similar identification number. Can be alphanumeric.',
    required: false,
    maxLength: 100,
    example: 'FAN123456XYZ',
  })
  @IsOptional()
  @IsString({ message: 'FAN number must be a string.' })
  @MaxLength(100)
  fanNumber?: string;
}
