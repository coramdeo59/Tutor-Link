import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { CoreModule } from '../../core/core.module';
import { SubjectGradeModule } from '../SubjectGrade/SubjectGrade.module';

@Module({
  imports: [CoreModule, SubjectGradeModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
