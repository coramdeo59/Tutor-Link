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
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
