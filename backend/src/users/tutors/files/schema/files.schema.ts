import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * File types for categorization
 */
export const fileTypes = ['assignment', 'learning_material', 'notes', 'other'] as const;

/**
 * Database schema for tutor files
 * Stores metadata about files uploaded by tutors for children
 */
export const tutorFiles = pgTable('tutor_files', {
  // Primary key and relations
  fileId: serial('file_id').primaryKey(),
  tutorId: integer('tutor_id').notNull(),
  childId: integer('child_id').notNull(),
  
  // File metadata
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  fileSize: integer('file_size').notNull(), // Size in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  
  // File location
  cloudinaryUrl: varchar('cloudinary_url', { length: 500 }).notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 200 }).notNull(),
  
  // Related entities (optional)
  subjectId: integer('subject_id'),
  assignmentId: integer('assignment_id'),
  sessionId: integer('session_id'),
  
  // Description and purpose
  description: text('description'),
  category: varchar('category', { length: 50 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
