import { IsNotEmpty, IsString, Length, IsAlphanumeric } from 'class-validator';

export class ChildLoginDto {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @Length(3, 30)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  password: string;
}
