// This file is deprecated. Use the centralized schema in ../academic-details/schema.ts
import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const subjects = pgTable('subjects', {
  subjectId: serial('subject_id').primaryKey(),
  subjectName: varchar('subject_name', { length: 100 }).notNull().unique(),
});

export const gradeLevels = pgTable('grade_levels', {
  gradeId: serial('grade_id').primaryKey(),
  gradeLevel: varchar('grade_Level', { length: 100 }).notNull().unique(),
});
