import { IsNotEmpty, IsEnum } from 'class-validator';
import { sessionStatus } from '../schema/sessions.schema';

/**
 * DTO for updating a session's status
 */
export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(sessionStatus)
  status: typeof sessionStatus[number];
}
