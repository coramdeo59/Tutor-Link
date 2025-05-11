import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { SubjectGradeService } from './SubjectGrade.service';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('SubjectGrade')
export class SubjectGradeController {
  constructor(private readonly subjectGradeService: SubjectGradeService) {}

  // Subject routes
  @Post('subjects')
  createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectGradeService.createSubject(createSubjectDto);
  }

  @Get('subjects')
  findAllSubjects() {
    return this.subjectGradeService.findAllSubjects();
  }

  @Get('subjects/:id')
  findOneSubject(@Param('id', ParseIntPipe) id: number) {
    return this.subjectGradeService.findOneSubject(id);
  }

  @Post('gradelevels')
  createGradeLevel(@Body() createGradeLevelDto: CreateGradeLevelDto) {
    return this.subjectGradeService.createGradeLevel(createGradeLevelDto);
  }

  @Get('grade-levels')
  findAllGradeLevels() {
    return this.subjectGradeService.findAllGradeLevels();
  }

  @Get('grade-levels/:id')
  findOneGradeLevel(@Param('id', ParseIntPipe) id: number) {
    return this.subjectGradeService.findOneGradeLevel(id);
  }
}
