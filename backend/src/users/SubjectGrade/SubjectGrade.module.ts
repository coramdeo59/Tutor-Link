import { Module } from '@nestjs/common';
import { SubjectGradeController } from './SubjectGrade.controller';
import { SubjectGradeService } from './SubjectGrade.service';

@Module({
  controllers: [SubjectGradeController],
  providers: [SubjectGradeService],
  exports: [SubjectGradeService],
})
export class SubjectGradeModule {}
