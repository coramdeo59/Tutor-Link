import { Module } from '@nestjs/common';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { CoreModule } from '../../core/core.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../auth/auth.module';
import jwtConfig from '../../auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig)
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {} 