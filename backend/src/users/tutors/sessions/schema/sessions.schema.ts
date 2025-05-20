import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  text,
} from 'drizzle-orm/pg-core';

/**
 * Session status options
 */
export const sessionStatus = ['scheduled', 'confirmed', 'completed', 'cancelled', 'in_progress'] as const;

/**
 * Database schema for tutoring sessions
 */
export const tutoringSessions = pgTable('tutoring_sessions', {
  // Primary key and relations
  sessionId: serial('session_id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  childId: integer('child_id').notNull(),
  subjectId: integer('subject_id').notNull(),
  
  // Session details
  title: varchar('title', { length: 200 }).notNull(),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).notNull(),
  
  // Time information
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
