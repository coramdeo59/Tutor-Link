import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { SubjectsGradeService } from './subjectsGrade.service';
import { SubjectsGradeController } from './subjectsGrade.controller';

@Module({
  imports: [
    CoreModule, // For database connection
    AuthModule, // For authentication and authorization
  ],
  controllers: [SubjectsGradeController],
  providers: [SubjectsGradeService],
  exports: [SubjectsGradeService], // Export so that other modules can use it
})
export class SubjectsGradeModule {}
