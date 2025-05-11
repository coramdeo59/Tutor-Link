import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [CoreModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
