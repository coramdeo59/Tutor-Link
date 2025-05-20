import { InferSelectModel, InferInsertModel, relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  decimal, // Added for amount
} from 'drizzle-orm/pg-core';

// Session status enum
export enum SessionStatus {
  REQUESTED = 'requested',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  MISSED = 'missed',
}

// Tutoring sessions table
export const tutoringSessions = pgTable('tutoring_sessions', {
  id: serial('id').primaryKey(),
  // Participants
  tutorId: integer('tutor_id').notNull(),
  childId: integer('child_id').notNull(),

  // Session details
  subjectId: integer('subject_id'),
  subjectName: varchar('subject_name', { length: 100 }).notNull(),
  gradeLevelId: integer('grade_level_id'),
  gradeLevelName: varchar('grade_level_name', { length: 50 }),
  // Scheduling information
  date: timestamp('date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }), // Added to store session cost
  // Status tracking
  status: varchar('status', { length: 20 })
    .notNull()
    .default(SessionStatus.REQUESTED),
  cancelledBy: integer('cancelled_by'),
  cancellationReason: text('cancellation_reason'),
  // Notes and metadata
  notes: text('notes'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tutor's availability (recurring weekly slots)
export const tutorAvailability = pgTable('tutor_availability', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(), // Monday, Tuesday, etc.
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tutor's unavailable dates (specific dates where tutor is not available)
export const tutorUnavailableDates = pgTable('tutor_unavailable_dates', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  date: timestamp('date').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const tutoringSessionsRelations = relations(tutoringSessions, ({ one }) => ({
  // Add relations here when needed
}));

export const tutorAvailabilityRelations = relations(tutorAvailability, ({ one }) => ({
  // Add relations here when needed
}));

// Types for use in application code
export type TutoringSession = InferSelectModel<typeof tutoringSessions>;
export type NewTutoringSession = InferInsertModel<typeof tutoringSessions>;

export type TutorAvailability = InferSelectModel<typeof tutorAvailability>;
export type NewTutorAvailability = InferInsertModel<typeof tutorAvailability>;

export type TutorUnavailableDate = InferSelectModel<typeof tutorUnavailableDates>;
export type NewTutorUnavailableDate = InferInsertModel<typeof tutorUnavailableDates>;
