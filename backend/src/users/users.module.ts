import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TutorsController } from './tutors/tutors.controller';
import { TutorsService } from './tutors/tutors.service';
import { CoreModule } from 'src/core/core.module';
import { AddressController } from './address/addres.controller';
import { AddressService } from './address/address.service';
import { AuthModule } from '../auth/auth.module';
import { SubjectGradeModule } from './SubjectGrade/SubjectGrade.module';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module'; // Import ParentModule
import { ChildModule } from './child/child.module'; // Import the new ChildModule

@Module({
  imports: [
    CoreModule,
    AuthModule,
    SubjectGradeModule,
    StudentModule,
    ParentModule, // Add ParentModule here
    ChildModule, // Add ChildModule here
  ],
  controllers: [UsersController, TutorsController, AddressController],
  providers: [UsersService, TutorsService, AddressService],
  exports: [UsersService],
})
export class UsersModule {}
