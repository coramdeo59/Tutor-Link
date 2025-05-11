import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddStudentSubjectDto {
  @ApiProperty({
    description: "The ID of the subject to add to the student's interests.",
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  subjectId: number;
}
