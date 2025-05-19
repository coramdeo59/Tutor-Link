import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    CoreModule, // Required for DATABASE_CONNECTION provider
    JwtModule.registerAsync(jwtConfig.asProvider()), // Required for JwtService
    ConfigModule.forFeature(jwtConfig), // Required for jwt configuration
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
