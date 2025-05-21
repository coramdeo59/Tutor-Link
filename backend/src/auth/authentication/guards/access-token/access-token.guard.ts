import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import jwtConfig from "src/auth/config/jwt.config";
import { REQUEST_USER_KEY } from "../../../constants";
import { ActiveUserData } from "src/auth/interfaces/active-user.data.interface";
import { AUTH_TYPE_KEY } from "../../decorators/auth.decorator";
import { AuthType } from "../../enums/auth-type.enum";

@Injectable()
export class AccessTokenGuard implements CanActivate {

	constructor(
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
		private readonly reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if the route is public
		const authTypes = this.reflector.getAllAndOverride<AuthType[]>(AUTH_TYPE_KEY, [
			context.getHandler(),
			context.getClass(),
		]) || [];

		// If the route is marked as public, allow access
		if (authTypes.includes(AuthType.None)) {
			return true;
		}

		// Get and validate the token from the request
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException("Access token is missing");
		}

		try {
			// Verify the JWT token with more relaxed options for development
			const payload = await this.jwtService.verifyAsync<ActiveUserData>(
				token, 
				{
					// Only use secret for verification, ignore audience/issuer in development
					secret: this.jwtConfiguration.secret,
					ignoreExpiration: false, // Still enforce expiration
				}
			);

			// Log the payload for debugging
			console.log('Token payload:', JSON.stringify(payload));
			request[REQUEST_USER_KEY] = payload;
		} catch (error) {
			// Enhanced error logging
			console.error('JWT verification failed:', error.message);
			throw new UnauthorizedException(`Invalid access token: ${error.message}`);
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const authHeader = request.headers.authorization;
		
		if (!authHeader) {
			return undefined;
		}
		
		// Handle case where the token already includes 'Bearer ' prefix correctly
		if (authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix (7 chars)
			return token;
		}
		
		// Attempt to split and check for alternative formats
		const parts = typeof authHeader === 'string' ? authHeader.split(' ') : [];
		
		// Check if first part is 'Bearer' (case-insensitive)
		if (parts.length >= 2 && typeof parts[0] === 'string' && parts[0].toLowerCase() === 'bearer') {
			const token = parts[1]?.trim() || '';
			if (token) {
				// console.log(`Found Bearer token from parts /(length: ${token.length})`);
				return token;
			}
		}
		
		// If header doesn't follow Bearer format, log this for debugging
		// console.log('Authorization header does not follow Bearer format, checking if it might be a raw token');
		
		// As a fallback, check if the entire header might be the token itself
		// This handles cases where frontend mistakenly sends token without 'Bearer ' prefix
		if (authHeader && authHeader.length > 20 && typeof authHeader === 'string' && authHeader.includes('.')) { 
			// Simple heuristic: JWT tokens are usually long and contain periods
			// console.log(`Treating entire Authorization header as token (length: ${authHeader.length})`);
			return authHeader.trim();
		}
		
		return undefined;
	}
}
