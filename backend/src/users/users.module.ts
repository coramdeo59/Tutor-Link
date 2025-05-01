import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TutorsController } from './tutors/tutors.controller';
import { TutorsService } from './tutors/tutors.service';
import { StudentsController } from './students/students.controller';
import { StudentsService } from './students/students.service';
import { ParentController } from './parent/parent.controller';
import { ParentService } from './parent/parent.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    UsersController,
    TutorsController,
    StudentsController,
    ParentController,
  ],
  providers: [UsersService, TutorsService, StudentsService, ParentService],
})
export class UsersModule {}
