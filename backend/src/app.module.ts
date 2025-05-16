import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoreModule } from './core/core.module';
import { UploadModule } from './upload/upload.module';
import { TutoringModule } from './tutoring/tutoring.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notifications/notification.module';
// import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    CoreModule,
    UploadModule,
    TutoringModule,
    AdminModule,
    NotificationModule,
    // MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
