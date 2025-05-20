import { Module } from "@nestjs/common";
import { HashingService } from "./hashing/hashing.service";
import { BcryptService } from "./hashing/bcrypt.service";
import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationService } from "./authentication/authentication.service";
import { PasswordResetController } from "./authentication/password-reset.controller";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "./config/jwt.config";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./authentication/guards/access-token/access-token.guard";
import { RefreshTokenIdsStorage } from "./authentication/refresh-token-ids.storage/refresh-token-ids.storage";
import { CoreModule } from "src/core/core.module";
import { AuthorizationModule } from "./authorization/authorization.module";
import { MailerModule } from "../mailer/mailer.module";
import { GuardModule } from "./authentication/guards/guard.module";

@Module({
	imports: [
		CoreModule,
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(jwtConfig),
		AuthorizationModule,
		MailerModule,
		GuardModule,
	],
	providers: [
		{ provide: HashingService, useClass: BcryptService },
		{
			provide: APP_GUARD,
			useClass: AccessTokenGuard,
		},
		RefreshTokenIdsStorage,
		AuthenticationService,
	],
	controllers: [AuthenticationController, PasswordResetController],
	exports: [HashingService, AuthenticationService, JwtModule, ConfigModule],
})
export class AuthModule {}
