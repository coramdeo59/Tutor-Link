import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown when a refresh token has been invalidated or is not valid
 */
export class InvalidatedRefreshTokenError extends UnauthorizedException {
  constructor() {
    super('Refresh token is invalid or has been revoked');
  }
}
