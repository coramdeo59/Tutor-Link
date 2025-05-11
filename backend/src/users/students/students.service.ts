import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { students, studentSubjects } from './schema'; // Added studentSubjects
import * as schema from '../../users/schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { users } from '../schema';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm'; // Import eq
import { SubjectGradeService } from '../SubjectGrade/SubjectGrade.service';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly subjectGradeService: SubjectGradeService,
  ) {}

  async create(createStudentDto: CreateStudentDto, userId: number) {
    // 1. Check if the user exists and what is their userType
    const user = await this.database.query.users.findFirst({
      where: eq(users.userId, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== 'student') {
      throw new ForbiddenException(
        'User is not a student. Cannot create student preferences.',
      );
    }

    // Ensure student profile row exists
    await this.database
      .insert(students)
      .values({ studentId: userId, gradeLevelId: null })
      .onConflictDoNothing();

    // Validate gradeLevelName if provided
    if (createStudentDto.gradeLevelName) {
      const grade = await this.subjectGradeService.findOneGradeLevelByName(
        createStudentDto.gradeLevelName,
      );
      if (!grade) {
        throw new NotFoundException(
          `Grade level "${createStudentDto.gradeLevelName}" not found`,
        );
      }
      await this.database
        .update(students)
        .set({ gradeLevelId: grade.gradeId })
        .where(eq(students.studentId, userId));
    }

    // Validate subjectNames if provided
    if (
      createStudentDto.subjectNames &&
      createStudentDto.subjectNames.length > 0
    ) {
      const entries: { studentId: number; subjectId: number }[] = [];
      for (const name of createStudentDto.subjectNames) {
        const sub = await this.subjectGradeService.findOneSubjectByName(name);
        if (!sub) {
          throw new NotFoundException(`Subject "${name}" not found`);
        }
        entries.push({ studentId: userId, subjectId: sub.subjectId });
      }
      await this.database
        .insert(studentSubjects)
        .values(entries)
        .onConflictDoNothing();
    }

    // Return the student's profile with preferences
    // Use the students table from ./schema for the query
    const studentProfile = await this.database.query['students'].findFirst({
      where: eq(students.studentId, userId),
      with: {
        gradeLevel: true,
        subjects: {
          with: {
            subject: true,
          },
        },
      },
    });

    return studentProfile;
  }

  // You can add other student-specific service methods here later
  // async findAll() {
  //   return this.db.select().from(students);
  // }

  // async findOne(id: number) {
  //   return this.db.query.students.findFirst({
  //     where: eq(students.studentId, id),
  //     // with: { user: true, gradeLevel: true, subjects: true } // example of loading relations
  //   });
  // }

  // async update(id: number, updateStudentDto: any /* Replace with UpdateStudentDto */) {
  //   const updatedStudent = await this.db
  //     .update(students)
  //     .set(updateStudentDto)
  //     .where(eq(students.studentId, id))
  //     .returning();
  //   return updatedStudent[0];
  // }

  // async remove(id: number) {
  //   const deletedStudent = await this.db
  //     .delete(students)
  //     .where(eq(students.studentId, id))
  //     .returning();
  //   return deletedStudent[0];
  // }
}
