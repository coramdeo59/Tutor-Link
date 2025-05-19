import { SetMetadata } from "@nestjs/common";
import { AuthType } from "src/auth/authentication/enums/auth-type.enum";

export const AUTH_TYPE_KEY = "authType";
export const Auth = (...authType: AuthType[]) => {
	return SetMetadata(AUTH_TYPE_KEY, authType);
};
