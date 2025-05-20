import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { ParentModule } from './users/parent/parent.module';
import { TutorsModule } from './users/tutors/tutors.module';
import { ChildModule } from './users/child/child.module';
import { AdminModule } from './users/admin/admin.module';
import { MailerModule } from './mailer/mailer.module';
import { PaymentModule } from './payment/payment.module';
import { SubjectsGradeModule } from './subjectAndGrade/subjectsGrade.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CoreModule,
    SubjectsGradeModule,
    ParentModule,
    TutorsModule,
    ChildModule,
    AdminModule,
    PaymentModule,
    MailerModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
