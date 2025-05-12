import {
  pgTable,
  integer,
  timestamp,
  primaryKey,
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
import { subjects, gradeLevels } from './SubjectGrade-schema';

export const tutors = pgTable('tutors', {
  tutorId: integer('tutor_id')
    .primaryKey()
    .references(() => users.userId, { onDelete: 'cascade' }),
  bio: text('bio'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verificationDetails = pgTable('verification_details', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id')
    .notNull()
    .unique() //
    .references(() => tutors.tutorId, { onDelete: 'cascade' }),
  documentPdfUrl: varchar('document_pdf_url', { length: 255 }),
  cvUrl: varchar('cv_url', { length: 255 }),
  kebeleIdUrl: varchar('kebele_id_url', { length: 255 }),
  nationalIdUrl: varchar('national_id_url', { length: 255 }),
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
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
    startTime: time('start_time').notNull(), // e.g., '09:00:00'
    endTime: time('end_time').notNull(), // e.g., '17:00:00'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    tutorDaySlotIdx: index('tutor_day_slot_idx').on(
      table.tutorId,
      table.dayOfWeek,
      table.startTime,
    ),
  }),
);

export const tutorSubjects = pgTable(
  'tutor_subjects',
  {
    tutorId: integer('tutor_id').notNull(),
    subjectId: integer('subject_id').notNull(),
    gradeId: integer('grade_id').notNull(),
  },
  (table) => ({
    pk: primaryKey(table.tutorId, table.subjectId, table.gradeId),
    tutorIdx: index('tutor_subjects_tutor_idx').on(table.tutorId),
    subjectIdx: index('tutor_subjects_subject_idx').on(table.subjectId),
    gradeIdx: index('tutor_subjects_grade_idx').on(table.gradeId),
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
  tutorSubjects: many(tutorSubjects),
  availabilitySlots: many(tutorAvailabilitySlots), // Relation to availability slots
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

export const tutorSubjectRelations = relations(tutorSubjects, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorSubjects.tutorId],
    references: [tutors.tutorId],
  }),
  subject: one(subjects, {
    // Ensure this 'subjects' refers to the one from ../schema
    fields: [tutorSubjects.subjectId],
    references: [subjects.subjectId],
  }),
  gradeLevel: one(gradeLevels, {
    // Ensure this 'gradeLevels' refers to the one from ../schema
    fields: [tutorSubjects.gradeId],
    references: [gradeLevels.gradeId],
  }),
}));
