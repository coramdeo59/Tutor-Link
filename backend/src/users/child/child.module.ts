import { Module } from '@nestjs/common';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { ProgressService } from './services/progress.service';
import { ProgressController } from './controllers/progress.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [ChildController, ProgressController],
  providers: [ChildService, ProgressService],
  exports: [ChildService, ProgressService],
})
export class ChildModule {}
