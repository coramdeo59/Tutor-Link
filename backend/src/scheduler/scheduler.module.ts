import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { CoreModule } from '../core/core.module';
import { PaymentModule } from '../payment/payment.module'; // Added for payment integration

@Module({
  imports: [CoreModule, PaymentModule], // Added PaymentModule
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
