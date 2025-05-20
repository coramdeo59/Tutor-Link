import { Module, Global } from '@nestjs/common';
import { AccessTokenGuard } from './access-token/access-token.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [AccessTokenGuard],
  exports: [AccessTokenGuard, JwtModule],
})
export class GuardModule {}
