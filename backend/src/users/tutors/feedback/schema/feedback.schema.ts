import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

/**
 * Feedback Types Enum
 * - Academic: Related to academic performance
 * - Behavioral: Related to behavior during sessions
 * - Progress: General progress feedback
 * - Assignment: Feedback on specific assignments
 */
export const feedbackTypes = ['academic', 'behavioral', 'progress', 'assignment'] as const;

/**
 * Database schema for tutor feedback
 * Allows tutors to provide structured feedback to children and parents
 */
export const tutorFeedback = pgTable('tutor_feedback', {
  // Primary key and basic metadata
  feedbackId: serial('feedback_id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  childId: integer('child_id').notNull(),
  parentId: integer('parent_id'),  // Optional, as feedback might be directed only to child
  
  // Core feedback fields
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  feedbackType: varchar('feedback_type', { length: 50 }).notNull(),
  
  // Related entities
  sessionId: integer('session_id'),  // Optional reference to specific session
  subjectId: integer('subject_id'),  // Subject the feedback relates to
  assignmentId: integer('assignment_id'), // Optional reference to an assignment
  
  // Visibility and acknowledgment
  isPrivate: boolean('is_private').default(false),  // If true, only for parent, not child
  isAcknowledged: boolean('is_acknowledged').default(false), // If parent/child has seen it
  acknowledgedAt: timestamp('acknowledged_at'),  // When feedback was acknowledged
  acknowledgedBy: integer('acknowledged_by'),  // Who acknowledged (parent or child ID)
  
  // Rating (optional - for structured feedback)
  rating: integer('rating'),  // e.g., 1-5 rating if applicable
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Database schema for feedback responses
 * Allows parents/children to respond to feedback
 */
export const feedbackResponses = pgTable('feedback_responses', {
  responseId: serial('response_id').primaryKey(),
  feedbackId: integer('feedback_id').notNull(),  // Reference to the original feedback
  responderId: integer('responder_id').notNull(),  // Person responding (parent or child ID)
  responderType: varchar('responder_type', { length: 20 }).notNull(),  // 'parent' or 'child'
  
  // Response content
  content: text('content').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
