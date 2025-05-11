import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { subjects, gradeLevels } from '../SubjectGrade/schema';

export const students = pgTable('students', {
  studentId: integer('student_id')
    .primaryKey()
    .references(() => users.userId, { onDelete: 'cascade' }),
  gradeLevelId: integer('grade_level_id').references(
    () => gradeLevels.gradeId,
    { onDelete: 'restrict' },
  ),
});

export const studentSubjects = pgTable(
  'student_subjects',
  {
    studentId: integer('student_id')
      .notNull()
      .references(() => students.studentId, { onDelete: 'cascade' }),
    subjectId: integer('subject_id')
      .notNull()
      .references(() => subjects.subjectId, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentId, table.subjectId] }),
  }),
);

export const studentRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.studentId],
    references: [users.userId],
  }),
  gradeLevel: one(gradeLevels, {
    fields: [students.gradeLevelId],
    references: [gradeLevels.gradeId],
  }),
  subjects: many(studentSubjects),
}));

export const studentSubjectRelations = relations(
  studentSubjects,
  ({ one }) => ({
    student: one(students, {
      fields: [studentSubjects.studentId],
      references: [students.studentId],
    }),
    subject: one(subjects, {
      fields: [studentSubjects.subjectId],
      references: [subjects.subjectId],
    }),
  }),
);
