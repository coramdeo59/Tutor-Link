import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SubjectsGradeService } from './subjectsGrade.service';
import { AccessTokenGuard } from '../auth/authentication/guards/access-token/access-token.guard';
import { Auth } from '../auth/authentication/decorators/auth.decorator';
import { AuthType } from '../auth/authentication/enums/auth-type.enum';
import { ActiveUser } from '../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user.data.interface';

@Controller('subject-grade')
export class SubjectsGradeController {
  constructor(private readonly subjectsGrade: SubjectsGradeService) { }

  // SUBJECT ENDPOINTS
  
  @Get('subjects')
  @Auth(AuthType.None)
  async getAllSubjects() {
    return this.subjectsGrade.getAllSubjects();
  }

  @Get('subjects/:id')
  @Auth(AuthType.None)
  async getSubjectById(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsGrade.getSubjectById(id);
  }

  @Get('tutor/:tutorId/subjects')
  @Auth(AuthType.None)
  async getSubjectsForTutor(@Param('tutorId', ParseIntPipe) tutorId: number) {
    return this.subjectsGrade.getSubjectsForTutor(tutorId);
  }

  @Get('child/:childId/subjects')
  @UseGuards(AccessTokenGuard)
  async getSubjectsForChild(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    // In the future, add authorization to verify this is the child's parent or an admin
    return this.subjectsGrade.getSubjectsForChild(childId);
  }

  // GRADE LEVEL ENDPOINTS
  
  @Get('grades')
  @Auth(AuthType.None)
  async getAllGradeLevels() {
    return this.subjectsGrade.getAllGradeLevels();
  }

  @Get('grades/:id')
  @Auth(AuthType.None)
  async getGradeLevelById(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsGrade.getGradeLevelById(id);
  }

  @Get('tutor/:tutorId/grades')
  @Auth(AuthType.None)
  async getGradesForTutor(@Param('tutorId', ParseIntPipe) tutorId: number) {
    return this.subjectsGrade.getGradesForTutor(tutorId);
  }

  @Get('child/:childId/grade')
  @UseGuards(AccessTokenGuard)
  async getGradeForChild(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    // In the future, add authorization to verify this is the child's parent or an admin
    return this.subjectsGrade.getGradeForChild(childId);
  }
}
