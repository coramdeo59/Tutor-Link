import { Module } from '@nestjs/common';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { SubjectGradeModule } from '../SubjectGrade/SubjectGrade.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [CoreModule, SubjectGradeModule],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
