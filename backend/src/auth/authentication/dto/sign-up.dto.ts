import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	IsOptional,
	IsEnum,
} from "class-validator";
import { Role } from "../enums/roles-type-enum";

export class SignUpDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MinLength(8)
	password: string;

	@IsNotEmpty()
	@IsString()
	firstName: string;

	@IsNotEmpty()
	@IsString()
	lastName: string;

	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@IsNotEmpty()
	@IsEnum(Role, { message: 'Role must be one of: ADMIN, PARENT, TUTOR, CHILD' })
	role: Role;
}
