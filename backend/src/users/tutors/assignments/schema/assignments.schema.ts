import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * Assignment status options
 */
export const assignmentStatus = ['assigned', 'in_progress', 'submitted', 'graded', 'late', 'missing'] as const;

/**
 * Submission status options
 */
export const submissionStatus = ['not_started', 'in_progress', 'submitted', 'graded', 'late', 'missing'] as const;

/**
 * Database schema for tutor assignments
 * Allows tutors to create and assign work to children
 */
export const assignments = pgTable('assignments', {
  // Primary key and basic metadata
  assignmentId: serial('assignment_id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  subjectId: integer('subject_id').notNull(),
  
  // Assignment details
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  instructions: text('instructions').notNull(),
  
  // Dates
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Additional metadata
  maxScore: integer('max_score').notNull(),
  estimatedTimeMinutes: integer('estimated_time_minutes'),
});

/**
 * Database schema for child assignment submissions
 * Tracks the progress and submissions for each child
 */
export const assignmentSubmissions = pgTable('assignment_submissions', {
  // Primary key and relations
  submissionId: serial('submission_id').primaryKey(),
  assignmentId: integer('assignment_id').notNull(),
  childId: integer('child_id').notNull(),
  
  // Submission details
  status: varchar('status', { length: 20 }).notNull(),
  score: integer('score'),
  comments: text('comments'),
  submissionText: text('submission_text'),
  
  // File references
  fileUrl: varchar('file_url', { length: 500 }),
  
  // Timestamps
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  gradedAt: timestamp('graded_at'),
});
