import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorDto } from './create-tutor.dto';
import { IsOptional } from 'class-validator';

export class UpdateTutorDto extends PartialType(CreateTutorDto) {
  @IsOptional()
  userId?: number;
}
