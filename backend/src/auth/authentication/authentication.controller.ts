import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
	Delete,
} from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { TutorSignUpDto } from "./dto/tutor-sign-up.dto";
import { ParentSignUpDto } from "./dto/parent-sign-up.dto";
import { AdminSignUpDto } from "./dto/admin-sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { AuthType } from "./enums/auth-type.enum";
import { Auth } from "./decorators/auth.decorator";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ActiveUser } from "../decorator/active-user.decorator";
import { ActiveUserData } from "../interfaces/active-user.data.interface";

@Auth(AuthType.None)
@Controller("auth")

export class AuthenticationController {
	constructor(private readonly authService: AuthenticationService) {}

	@Post("sign-up")
	async signup(@Body() signUpDto: SignUpDto) {
		return this.authService.signup(signUpDto);
	}


	@Post("sign-up/tutor")
	async signupTutor(@Body() signUpDto: TutorSignUpDto) {
		return this.authService.signup(signUpDto);
	}

	@Post("sign-up/parent")
	async signupParent(@Body() signUpDto: ParentSignUpDto) {
		return this.authService.signup(signUpDto);
	}

	@Post("sign-up/admin")
	async signupAdmin(@Body() signUpDto: AdminSignUpDto) {
		return this.authService.signup(signUpDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post("sign-in")
	async signin(@Body() signInDto: SignInDto) {
		return await this.authService.signIn(signInDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post("refresh-tokens")

	async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
		return await this.authService.refreshTokens(refreshTokenDto);
	}

	@HttpCode(HttpStatus.OK)
	@Delete("sign-out")
	@Auth(AuthType.Bearer)
	async signOut(@ActiveUser() user: ActiveUserData) {
		return await this.authService.signOut(user.sub);
	}
}
 