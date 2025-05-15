import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core/core.module';
import { TutoringService } from './tutoring.service';
import { TutoringController } from './tutoring.controller';

@Module({
  imports: [CoreModule],
  providers: [TutoringService],
  controllers: [TutoringController],
  exports: [TutoringService],
})
export class TutoringModule {}
