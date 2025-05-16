import {
  pgTable,
  integer,
  timestamp,
  index,
  text,
  boolean,
  varchar,
  serial,
  pgEnum,
  time,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './User-schema';

// Enum for verification status
export const verificationStatusEnum = pgEnum('verification_status', [
  'pending',
  'approved',
  'rejected',
]);

// Enum for background check status
export const backgroundCheckStatusEnum = pgEnum('background_check_status', [
  'pending',
  'passed',
  'failed',
]);

export const tutors = pgTable('tutors', {
  tutorId: integer('tutor_id')
    .primaryKey()
    .references(() => users.userId, { onDelete: 'cascade' }),
  bio: text('bio'),
  isVerified: boolean('is_verified').default(false).notNull(),
  subjectId: integer('subject_id').notNull(),
  gradeId: integer('grade_id').notNull(),
  approved: boolean('approved').default(false).notNull(),
  approvedAt: timestamp('approved_at'),
  verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
  backgroundCheckStatus: backgroundCheckStatusEnum('background_check_status').default('pending').notNull(),
  documentVerified: boolean('document_verified').default(false).notNull(),
  interviewScheduled: boolean('interview_scheduled').default(false).notNull(),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verificationDetails = pgTable('verification_details', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id')
    .notNull()
    .unique() //
    .references(() => tutors.tutorId, { onDelete: 'cascade' }),
  documentUpload: varchar('document_Upload', { length: 255 }),
  cvUpload: varchar('cv_url', { length: 255 }),
  kebeleIdUpload: varchar('kebele_id_Upload', { length: 255 }),
  nationalIdUpload: varchar('national_id_Upload', { length: 255 }),
  fanNumber: varchar('fan_number', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Enum for days of the week
export const dayOfWeekEnum = pgEnum('day_of_week_enum', [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

export const tutorAvailabilitySlots = pgTable(
  'tutor_availability_slots',
  {
    id: serial('id').primaryKey(),
    tutorId: integer('tutor_id')
      .notNull()
      .references(() => tutors.tutorId, { onDelete: 'cascade' }),
    dayOfWeek: dayOfWeekEnum('day_of_week').array().notNull(), // Changed to array of day_of_week_enum
    startTime: time('start_time').notNull(), // e.g., '09:00:00'
    endTime: time('end_time').notNull(), // e.g., '17:00:00'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    tutorDaySlotIdx: index('tutor_day_slot_idx').on(
      table.tutorId,
      table.startTime,
    ), // Removed dayOfWeek from index since it's now an array
  }),
);

// Relations

export const tutorRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.tutorId],
    references: [users.userId],
  }),
  verificationDetail: one(verificationDetails, {
    fields: [tutors.tutorId],
    references: [verificationDetails.tutorId],
  }),
}));

export const verificationDetailsRelations = relations(
  verificationDetails,
  ({ one }) => ({
    tutor: one(tutors, {
      // Relation back to tutors
      fields: [verificationDetails.tutorId],
      references: [tutors.tutorId],
    }),
  }),
);

export const tutorAvailabilitySlotsRelations = relations(
  tutorAvailabilitySlots,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutorAvailabilitySlots.tutorId],
      references: [tutors.tutorId],
    }),
  }),
);
