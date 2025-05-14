import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateStateDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;
}
