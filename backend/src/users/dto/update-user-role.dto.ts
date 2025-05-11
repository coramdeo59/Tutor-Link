import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../enums/role-enums';

export class UpdateUserRoleDto {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be either "regular" or "admin"' })
  role: Role;
}
