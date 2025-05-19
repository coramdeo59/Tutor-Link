import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../../decorators/roles.decorator";

import { ActiveUserData } from "../../../interfaces/active-user.data.interface";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// If no roles are required, allow access
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();
		const userData = user as ActiveUserData;

		// Check if the user has any of the required roles
		return requiredRoles.some((role) => userData.role === role);
	}
}
