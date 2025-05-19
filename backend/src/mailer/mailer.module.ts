import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import emailConfig from '../config/email.config';

@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
