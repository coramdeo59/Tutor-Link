import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStateDto {
  @ApiProperty({ description: 'The name of the state', example: 'California' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class StateResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  countryId: number;
}
