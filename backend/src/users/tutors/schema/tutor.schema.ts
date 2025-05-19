import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel, relations } from 'drizzle-orm';

// Tutors table - includes all user information directly
export const tutors = pgTable('tutors', {
  // Primary key
  tutorId: serial('tutor_id').primaryKey(),
  
  // User authentication information
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Personal information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  
  // Address information - direct fields without references
  street: varchar('street', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('Ethiopia'),
  
  // Tutor-specific information
  bio: text('bio'),
  hourlyRate: integer('hourly_rate').default(0),
  rating: integer('rating').default(0),
  reviewCount: integer('review_count').default(0),
  
  // Basic verification status
  isVerified: boolean('is_verified').default(false),
  role: varchar('role', { length: 50 }).default('tutor').notNull(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tutor Subjects Schema
export const tutorSubjects = pgTable(
  'tutor_subjects',
  {
    id: serial('id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    subjectName: varchar('subject_name', { length: 100 }).notNull(),
    subjectId: integer('subject_id'),
    createdAt: timestamp('created_at').defaultNow(),
  }
);

// Tutor Grade Levels Schema

// Tutor Availability Schema
export const tutorAvailability = pgTable(
  'tutor_availability',
  {
    id: serial('id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }
);

// Unified Tutor Verification Schema
export const tutorVerifications = pgTable(
  'tutor_verifications',
  {
    id: serial('id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    // national id  fan nubmer 
    fanNumber: varchar('fan_number', { length: 100 }),
    // Verification status
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    verificationDate: timestamp('verification_date'),
    // Document uploads
    idDocumentUrl: varchar('id_document_url', { length: 255 }),
    cvUrl: varchar('cv_url', { length: 255 }),
    
    // Education information
    educationLevel: varchar('education_level', { length: 100 }),
    institutionName: varchar('institution_name', { length: 255 }),
    degree: varchar('degree', { length: 100 }),
    graduationYear: varchar('graduation_year', { length: 4 }),
 
    
    // Professional experience
    yearsOfExperience: integer('years_of_experience'),
    hasTeachingCertificate: boolean('has_teaching_certificate').default(false),
    certificateUrl: varchar('certificate_url', { length: 255 }),

    
    // Final decision
    approved: boolean('approved').default(false),
    approvedAt: timestamp('approved_at'),
    rejectionReason: text('rejection_reason'),
    
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
);

// After the tutorSubjects definition and before the tutorAvailability definition:

// Tutor Grade Levels Schema
export const tutorGrades = pgTable(
  'tutor_grades',
  {
    id: serial('id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    gradeName: varchar('grade_name', { length: 100 }).notNull(),
  }
);

// Define relations for tutors
export const tutorsRelations = relations(tutors, ({ many }) => ({
  subjects: many(tutorSubjects),
  grades: many(tutorGrades),
  availability: many(tutorAvailability),
  verifications: many(tutorVerifications),
}));

// Define relations for tutor subjects
export const tutorSubjectsRelations = relations(tutorSubjects, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorSubjects.tutorId],
    references: [tutors.tutorId],
  }),
}));

// Define relations for tutor grades
export const tutorGradesRelations = relations(tutorGrades, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorGrades.tutorId],
    references: [tutors.tutorId],
  }),
}));

// Define relations for tutor availability
export const tutorAvailabilityRelations = relations(tutorAvailability, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorAvailability.tutorId],
    references: [tutors.tutorId],
  }),
}));

// Define relations for tutor verifications
export const tutorVerificationsRelations = relations(tutorVerifications, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorVerifications.tutorId],
    references: [tutors.tutorId],
  }),
}));

// Infer model types for TypeScript
export type Tutor = InferSelectModel<typeof tutors>;
export type NewTutor = InferInsertModel<typeof tutors>;
export type TutorSubject = InferSelectModel<typeof tutorSubjects>;
export type NewTutorSubject = InferInsertModel<typeof tutorSubjects>;
export type TutorGrade = InferSelectModel<typeof tutorGrades>;
export type NewTutorGrade = InferInsertModel<typeof tutorGrades>;
export type TutorAvailabilitySlot = InferSelectModel<typeof tutorAvailability>;
export type NewTutorAvailabilitySlot = InferInsertModel<typeof tutorAvailability>;
export type TutorVerification = InferSelectModel<typeof tutorVerifications>;
export type NewTutorVerification = InferInsertModel<typeof tutorVerifications>;
