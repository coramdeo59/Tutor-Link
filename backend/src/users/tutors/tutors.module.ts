import { Module } from '@nestjs/common';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { CoreModule } from '../../core/core.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../auth/auth.module';
import jwtConfig from '../../auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';

// Import our new feature modules
import { FeedbackModule } from './feedback/feedback.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SessionsModule } from './sessions/sessions.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [
    CoreModule,
    AuthModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    // Add our new feature modules
    FeedbackModule,
    AssignmentsModule,
    SessionsModule,
    FilesModule,
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {} 