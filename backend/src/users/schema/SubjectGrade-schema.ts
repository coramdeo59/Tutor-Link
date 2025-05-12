import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm'; 
import { tutorSubjects } from './Tutor-schema'; 

export const subjects = pgTable('subjects', {
  subjectId: serial('subject_id').primaryKey(),
  subjectName: varchar('subject_name', { length: 100 }).notNull().unique(),
});

export const gradeLevels = pgTable('grade_levels', {
  gradeId: serial('grade_id').primaryKey(),
  gradeLevel: varchar('grade_Level', { length: 100 }).notNull().unique(),
});

export const subjectRelations = relations(subjects, ({ many }) => ({
  tutorSubjects: many(tutorSubjects),
}));

export const gradeLevelRelations = relations(gradeLevels, ({ many }) => ({
  tutorSubjects: many(tutorSubjects),
}));


