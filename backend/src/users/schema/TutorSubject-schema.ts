import {
  pgTable,
  integer,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tutors } from './Tutor-schema';
import { subjects } from './SubjectGrade-schema';

// Create a many-to-many relationship between tutors and subjects
export const tutorSubjects = pgTable(
  'tutor_subjects',
  {
    tutorId: integer('tutor_id')
      .notNull()
      .references(() => tutors.tutorId, { onDelete: 'cascade' }),
    subjectId: integer('subject_id')
      .notNull()
      .references(() => subjects.subjectId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tutorId, table.subjectId] }),
    tutorIdx: index('tutor_subject_tutor_idx').on(table.tutorId),
    subjectIdx: index('tutor_subject_subject_idx').on(table.subjectId),
  }),
);

export const tutorSubjectsRelations = relations(tutorSubjects, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorSubjects.tutorId],
    references: [tutors.tutorId],
  }),
  subject: one(subjects, {
    fields: [tutorSubjects.subjectId],
    references: [subjects.subjectId],
  }),
}));