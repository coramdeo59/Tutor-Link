import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ActiveUserData } from "src/auth/interfaces/active-user.data.interface";
import { REQUEST_USER_KEY } from "src/auth/constants";
import { Role } from "src/auth/authentication/enums/roles-type-enum";
import { ROLES_KEY } from "../../roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const contextRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!contextRoles) {
			return true;
		}

		const user: ActiveUserData = context.switchToHttp().getRequest()[
			REQUEST_USER_KEY
		];

		return contextRoles.some((role) => user.role === role);
	}
}
