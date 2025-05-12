import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/SubjectGrade-schema';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class SubjectGradeService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  // Subject methods
  async createSubject(createSubjectDto: CreateSubjectDto) {
    const { subjectName } = createSubjectDto;
    const [newSubject] = await this.database
      .insert(schema.subjects)
      .values({ subjectName })
      .returning();
    return newSubject;
  }

  async findAllSubjects() {
    return this.database.query.subjects.findMany();
  }

  async findOneSubject(id: number) {
    return this.database.query.subjects.findFirst({
      where: eq(schema.subjects.subjectId, id),
    });
  }

  // Fetch by name
  async findOneSubjectByName(name: string) {
    return this.database.query.subjects.findFirst({
      where: eq(schema.subjects.subjectName, name),
    });
  }

  async createGradeLevel(createGradeLevelDto: CreateGradeLevelDto) {
    const { gradeLevel } = createGradeLevelDto;
    const [newGradeLevel] = await this.database
      .insert(schema.gradeLevels)
      .values({ gradeLevel })
      .returning();
    return newGradeLevel;
  }

  async findAllGradeLevels() {
    return this.database.query.gradeLevels.findMany();
  }

  async findOneGradeLevel(id: number) {
    return this.database.query.gradeLevels.findFirst({
      where: eq(schema.gradeLevels.gradeId, id),
    });
  }

  async findOneGradeLevelByName(name: string) {
    return this.database.query.gradeLevels.findFirst({
      where: eq(schema.gradeLevels.gradeLevel, name),
    });
  }
}
