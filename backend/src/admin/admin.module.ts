import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    CoreModule, // Provides DATABASE_CONNECTION
    AuthModule, // Provides authentication services and guards
    forwardRef(() => NotificationModule), // Import notification module with circular dependency protection
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
