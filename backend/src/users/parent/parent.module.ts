import { Module, forwardRef } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { CoreModule } from 'src/core/core.module'; // Assuming DB connection is managed here
import { AuthModule } from 'src/auth/auth.module'; // For HashingService and AuthenticationService

@Module({
  imports: [
    CoreModule, // Provides DATABASE_CONNECTION
    forwardRef(() => AuthModule), // Using forwardRef to break circular dependency
  ],
  controllers: [ParentController],
  providers: [
    ParentService,
    // The HashingService is already provided by AuthModule, so we don't need to re-provide it
  ],
  exports: [ParentService],
})
export class ParentModule {}
