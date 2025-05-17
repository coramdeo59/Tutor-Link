import { Module, forwardRef } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { RolesGuard } from './authentication/guards/roles/roles.guard';
import { AddressModule } from '../users/address/address.module'; // Corrected import path
import { ParentModule } from '../users/parent/parent.module'; // Import ParentModule for ParentService
import { UploadModule } from '../upload/upload.module'; // Import UploadModule for file uploads

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    AddressModule,
    forwardRef(() => ParentModule), // Adding ParentModule with forwardRef to break circular dependency
    UploadModule, // Add UploadModule to use UploadService
  ],
  controllers: [AuthenticationController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthenticationService,
    RefreshTokenIdsStorage,
    AccessTokenGuard,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [HashingService, AuthenticationService],
})
export class AuthModule {}
