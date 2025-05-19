import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class AddSubjectDto {
  @IsNotEmpty()
  @IsString()
  subjectName: string;
}

export class AddSubjectsDto {
  @IsArray()
  @IsNotEmpty()
  subjects: AddSubjectDto[];
}

export class GetSubjectsResponseDto {
  id: number;
  tutorId: number;
  subjectName: string;
  subjectId?: number;
  createdAt: Date;
}