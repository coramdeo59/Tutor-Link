import { IsEnum, IsNotEmpty } from 'class-validator';
import { userTypeEnum } from '../schema';

export class UpdateUserTypeDto {
  @IsNotEmpty({ message: 'User type is required' })
  @IsEnum(userTypeEnum.enumValues, {
    message: 'User type must be tutor, student, or parent',
  })
  userType: (typeof userTypeEnum.enumValues)[number];
}
