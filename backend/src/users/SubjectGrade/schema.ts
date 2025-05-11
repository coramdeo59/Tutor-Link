// This file is deprecated. Use the centralized schema in ../academic-details/schema.ts
import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { studentSubjects, students } from '../students/schema';
import { tutorSubjects, tutors } from '../tutors/schema';

export const subjects = pgTable('subjects', {
  subjectId: serial('subject_id').primaryKey(),
  subjectName: varchar('subject_name', { length: 100 }).notNull().unique(),
});

export const gradeLevels = pgTable('grade_levels', {
  gradeId: serial('grade_id').primaryKey(),
  gradeLevel: varchar('grade_Level', { length: 100 }).notNull().unique(),
});

export const subjectRelations = relations(subjects, ({ many }) => ({
  studentSubjects: many(studentSubjects),
  tutorSubjects: many(tutorSubjects),
}));

export const gradeLevelRelations = relations(gradeLevels, ({ many }) => ({
  students: many(students),
  tutorSubjects: many(tutorSubjects),
}));

// This relation might be better placed in tutors/schema.ts if it causes issues here.
export const tutorAcademicDetailRelations = relations(tutors, ({ many }) => ({
  tutorSubjects: many(tutorSubjects),
}));
