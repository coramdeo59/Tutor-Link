import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TutorsController } from './tutors/tutors.controller';
import { StudentsController } from './students/students.controller';
import { TutorsService } from './tutors/tutors.service';
import { StudentsService } from './students/students.service';
import { CoreModule } from 'src/core/core.module';
import { AddressController } from './address/addres.controller';
import { AddressService } from './address/address.service';
import { StudentsModule } from './students/students.module';
import { AuthModule } from '../auth/auth.module';
import { SubjectGradeModule } from './SubjectGrade/SubjectGrade.module';

@Module({
  imports: [CoreModule, StudentsModule, AuthModule, SubjectGradeModule],
  controllers: [
    UsersController,
    TutorsController,
    StudentsController,
    AddressController,
  ],
  providers: [UsersService, TutorsService, StudentsService, AddressService],
  exports: [UsersService],
})
export class UsersModule {}
