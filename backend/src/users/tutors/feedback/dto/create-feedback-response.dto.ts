import { IsNotEmpty, IsString, IsInt, IsEnum } from 'class-validator';

enum ResponderType {
  PARENT = 'parent',
  CHILD = 'child'
}

export class CreateFeedbackResponseDto {
  @IsNotEmpty()
  @IsInt()
  feedbackId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(ResponderType)
  responderType: ResponderType;

  @IsNotEmpty()
  @IsInt()
  responderId: number;
}
