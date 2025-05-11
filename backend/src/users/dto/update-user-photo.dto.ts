import { IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateUserPhotoDto {
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'Photo URL must be valid' })
  @ValidateIf((o) => o.photo !== null)
  @IsOptional()
  photo?: string | null;
}
