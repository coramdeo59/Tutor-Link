import { pgTable, serial, text, varchar, boolean, timestamp, integer, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../users/schema';

// Create enums for consistent data types
export const educationLevelEnum = pgEnum('education_level', [
  'elementary',
  'middle_school',
  'high_school',
  'college',
  'graduate',
  'kindergarten'
]);

export const verificationStatusEnum = pgEnum('verification_status', [
  'pending',
  'verified',
  'rejected',
  'provided'
]);

// Main tutor table
export const tutors = pgTable('tutors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  hourlyRate: integer('hourly_rate'),
  isAvailable: boolean('is_available').default(true),
  currentTitle: varchar('current_title', { length: 255 }),
  videoIntroduction: text('video_introduction'),
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').default(0),
  identityVerified: verificationStatusEnum('identity_verified').default('pending'),
  backgroundCheckVerified: verificationStatusEnum('background_check_verified').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tutor education table
export const tutorEducation = pgTable('tutor_education', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }).notNull(),
  field: varchar('field', { length: 255 }),
  startYear: integer('start_year'),
  endYear: integer('end_year'),
  isCompleted: boolean('is_completed').default(true),
  certificateUrl: text('certificate_url'),
  verificationStatus: verificationStatusEnum('verification_status').default('pending'),
});

// Subjects table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
});

// Junction table for tutors and subjects
export const tutorSubjects = pgTable('tutor_subjects', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  experienceYears: integer('experience_years'),
  proficiencyLevel: integer('proficiency_level'), // 1-5 rating
  isSpecialty: boolean('is_specialty').default(false),
});

// Tutor availability table
export const tutorAvailability = pgTable('tutor_availability', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 for Sunday-Saturday
  startTime: varchar('start_time', { length: 10 }).notNull(), // Format: HH:MM 24h
  endTime: varchar('end_time', { length: 10 }).notNull(), // Format: HH:MM 24h
  isRecurring: boolean('is_recurring').default(true),
});

// Tutor specialties table
export const tutorSpecialties = pgTable('tutor_specialties', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
});

// Grade levels table
export const gradeLevels = pgTable('grade_levels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  level: educationLevelEnum('level').notNull(),
});

// Junction table for tutors and grade levels
export const tutorGradeLevels = pgTable('tutor_grade_levels', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  gradeLevelId: integer('grade_level_id').references(() => gradeLevels.id, { onDelete: 'cascade' }).notNull(),
});

// Reviews table
export const tutorReviews = pgTable('tutor_reviews', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').references(() => tutors.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').notNull(), // Reference to a users table if you have one
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships
export const tutorsRelations = relations(tutors, ({ many }) => ({
  education: many(tutorEducation),
  subjects: many(tutorSubjects),
  availability: many(tutorAvailability),
  specialties: many(tutorSpecialties),
  gradeLevels: many(tutorGradeLevels),
  reviews: many(tutorReviews),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  tutors: many(tutorSubjects),
}));

export const gradeLevelsRelations = relations(gradeLevels, ({ many }) => ({
  tutors: many(tutorGradeLevels),
}));