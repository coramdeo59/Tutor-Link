import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    CoreModule, // Provides DATABASE_CONNECTION
    AuthModule, // Provides authentication services and guards
    forwardRef(() => AdminModule), // Handle circular dependency with Admin module
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {} 