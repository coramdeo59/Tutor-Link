import { Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { CoreModule } from 'src/core/core.module'; // Assuming DB connection is managed here
import { AuthModule } from 'src/auth/auth.module'; // For HashingService and AuthenticationService

@Module({
  imports: [
    CoreModule, // Provides DATABASE_CONNECTION
    AuthModule, // Provides HashingService, AuthenticationService
  ],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
