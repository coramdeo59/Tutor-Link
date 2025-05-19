import { SetMetadata, UseGuards } from '@nestjs/common';
import { AuthType } from '../authentication/enums/auth-type.enum';
import { AccessTokenGuard } from '../authentication/guards/access-token/access-token.guard';
import { applyDecorators } from '@nestjs/common';

export const AUTH_TYPE_KEY = 'authType';    

export function Auth(authType: AuthType) {
  return applyDecorators(
    SetMetadata(AUTH_TYPE_KEY, authType),
    UseGuards(AccessTokenGuard)
  );
}
