import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTutorProfileDto {

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

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
