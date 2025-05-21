import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  text,
  date,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { children } from '../../parent/schema/parent.schema';

// Import external schema definitions
// We'll reference the existing tables instead of creating new ones

// Reference to existing subjects table
export const subjects = pgTable('subjects', {
  subjectId: serial('subject_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reference to existing child_subjects table
export const childSubjects = pgTable('child_subjects', {
  childSubjectId: serial('child_subject_id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId, { onDelete: 'cascade' }),
  enrollmentDate: date('enrollment_date').defaultNow().notNull(),
  currentProgress: integer('current_progress').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Child tutoring sessions table - use a different name to avoid conflicts
export const childSessions = pgTable('child_tutoring_sessions', {
  sessionId: serial('session_id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  tutorId: integer('tutor_id').notNull(), // References tutors table
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: varchar('status', { length: 20 }).default('scheduled').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Progress assessments table - tracks individual progress assessments
export const progressAssessments = pgTable('child_progress_assessments', {
  assessmentId: serial('assessment_id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => childSessions.sessionId, { onDelete: 'cascade' }),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId),
  progressPercentage: integer('progress_percentage').notNull(),
  assessmentDate: timestamp('assessment_date').defaultNow().notNull(),
  tutorNotes: text('tutor_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    childIdIdx: index('child_progress_assessments_child_id_idx').on(table.childId),
    subjectIdIdx: index('child_progress_assessments_subject_id_idx').on(table.subjectId),
    validProgressCheck: check('valid_progress_check', sql`progress_percentage BETWEEN 0 AND 100`),
  };
});

// Define relations for subjects table
export const subjectsRelations = relations(subjects, ({ many }) => ({
  childSubjects: many(childSubjects),
  sessions: many(childSessions),
  progressAssessments: many(progressAssessments),
}));

// Define relations for childSubjects table
export const childSubjectsRelations = relations(childSubjects, ({ one }) => ({
  child: one(children, {
    fields: [childSubjects.childId],
    references: [children.childId],
  }),
  subject: one(subjects, {
    fields: [childSubjects.subjectId],
    references: [subjects.subjectId],
  }),
}));

// Define relations for sessions table
export const sessionsRelations = relations(childSessions, ({ one, many }) => ({
  child: one(children, {
    fields: [childSessions.childId],
    references: [children.childId],
  }),
  subject: one(subjects, {
    fields: [childSessions.subjectId],
    references: [subjects.subjectId],
  }),
  progressAssessments: many(progressAssessments),
}));

// Define relations for progressAssessments table
export const progressAssessmentsRelations = relations(progressAssessments, ({ one }) => ({
  session: one(childSessions, {
    fields: [progressAssessments.sessionId],
    references: [childSessions.sessionId],
  }),
  child: one(children, {
    fields: [progressAssessments.childId],
    references: [children.childId],
  }),
  subject: one(subjects, {
    fields: [progressAssessments.subjectId],
    references: [subjects.subjectId],
  }),
}));
