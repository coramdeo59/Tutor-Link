import {
  pgTable,
  integer,
  varchar,
  timestamp,
  index,
  primaryKey,
  serial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';

// Subjects table (shared between tutors and students)
export const subjects = pgTable('subjects', {
  subjectId: serial('subject_id').primaryKey(),
  subjectName: varchar('subject_name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Grade Levels table (corrected naming)
export const gradeLevels = pgTable('grade_levels', {
  gradeId: serial('grade_id').primaryKey(),
  gradeName: varchar('grade_name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Student tutoring preferences (junction table)
export const studentSubjects = pgTable(
  'student_subjects',
  {
    studentId: integer('student_id')
      .notNull()
      .references(() => students.studentId, { onDelete: 'cascade' }),
    subjectId: integer('subject_id')
      .notNull()
      .references(() => subjects.subjectId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentId, table.subjectId] }),
    subjectIdx: index('student_subjects_subject_idx').on(table.subjectId),
  }),
);

// Students table with proper structure
export const students = pgTable(
  'students',
  {
    studentId: integer('student_id')
      .primaryKey()
      .references(() => users.userId, { onDelete: 'cascade' }),
    gradeLevelId: integer('grade_level_id').references(
      () => gradeLevels.gradeId,
      { onDelete: 'restrict' },
    ),
    schoolName: varchar('school_name', { length: 255 }),
    enrollmentDate: timestamp('enrollment_date').notNull().defaultNow(),
    graduationYear: integer('graduation_year'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    gradeIdx: index('students_grade_idx').on(table.gradeLevelId),
    schoolIdx: index('students_school_idx').on(table.schoolName),
  }),
);

// Relations
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
