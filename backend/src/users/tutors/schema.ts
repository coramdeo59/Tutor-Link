import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  primaryKey,
  index,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { subjects, gradeLevels } from '../SubjectGrade/schema'; // Updated import

// Tutor base table
export const tutors = pgTable('tutors', {
  tutorId: integer('tutor_id')
    .primaryKey()
    .references(() => users.userId, { onDelete: 'cascade' }),
  bio: text('bio'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Core Tutor Tables
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

export const tutorWorkExperiences = pgTable(
  'tutor_work_experiences',
  {
    workExperienceId: serial('work_experience_id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    workTitle: varchar('work_title', { length: 100 }).notNull(),
    workInstitution: varchar('work_institution', { length: 255 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
  },
  (table) => ({
    tutorIdx: index('tutor_work_experiences_tutor_idx').on(table.tutorId),
  }),
);

export const tutorEducations = pgTable(
  'tutor_educations',
  {
    educationId: serial('education_id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    major: varchar('major', { length: 100 }).notNull(),
    educationInstitution: varchar('education_institution', {
      length: 255,
    }).notNull(),
    graduationYear: integer('graduation_year').notNull(),
    educationTypeId: integer('education_type_id').notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    photo: varchar('photo', { length: 255 }),
  },
  (table) => ({
    tutorIdx: index('tutor_educations_tutor_idx').on(table.tutorId),
    typeIdx: index('tutor_educations_type_idx').on(table.educationTypeId),
  }),
);

export const tutorIdDocuments = pgTable(
  'tutor_id_documents',
  {
    documentId: serial('document_id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    photoFront: varchar('photo_front', { length: 255 }).notNull(),
    photoBack: varchar('photo_back', { length: 255 }).notNull(),
    countryName: varchar('country_name', { length: 100 }).notNull(), // Changed from countryId
    provinceName: varchar('province_name', { length: 100 }).notNull(), // Changed from provinceId
    type: varchar('type', { length: 50 }).notNull(),
    documentNumber: varchar('document_number', { length: 100 }).notNull(),
  },
  (table) => ({
    tutorIdx: index('tutor_id_documents_tutor_idx').on(table.tutorId),
    // Removed countryIdx and provinceIdx
  }),
);

export const tutorTeachingLicenses = pgTable(
  'tutor_teaching_licenses',
  {
    licenseId: serial('license_id').primaryKey(),
    tutorId: integer('tutor_id').notNull(),
    photo: varchar('photo', { length: 255 }).notNull(),
    issueBody: varchar('issue_body', { length: 255 }).notNull(),
    issuingCountryName: varchar('issuing_country_name', {
      length: 100,
    }).notNull(),
    issuerProvinceName: varchar('issuer_province_name', {
      length: 100,
    }).notNull(),
    certificationName: varchar('certification_name', { length: 100 }).notNull(),
    subjectArea: varchar('subject_area', { length: 100 }).notNull(),
    gradeLevel: varchar('grade_level', { length: 50 }).notNull(),
    issueDate: timestamp('issue_date').notNull(),
    expirationDate: timestamp('expiration_date').notNull(),
  },
  (table) => ({
    tutorIdx: index('tutor_teaching_licenses_tutor_idx').on(table.tutorId),
    // Removed countryIdx and provinceIdx
  }),
);

export const educationTypes = pgTable('education_types', {
  educationTypeId: serial('education_type_id').primaryKey(),
  educationTypeName: varchar('education_type_name', { length: 50 }).notNull(),
});

// Relations
export const tutorRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.tutorId],
    references: [users.userId],
  }),
  subjects: many(tutorSubjects),
  workExperiences: many(tutorWorkExperiences),
  educations: many(tutorEducations),
  idDocuments: many(tutorIdDocuments),
  teachingLicenses: many(tutorTeachingLicenses),
}));

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

export const tutorWorkExperienceRelations = relations(
  tutorWorkExperiences,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutorWorkExperiences.tutorId],
      references: [tutors.tutorId],
    }),
  }),
);

export const tutorEducationRelations = relations(
  tutorEducations,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutorEducations.tutorId],
      references: [tutors.tutorId],
    }),
    educationType: one(educationTypes, {
      fields: [tutorEducations.educationTypeId],
      references: [educationTypes.educationTypeId],
    }),
  }),
);

export const tutorIdDocumentRelations = relations(
  tutorIdDocuments,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutorIdDocuments.tutorId],
      references: [tutors.tutorId],
    }),
  }),
);

export const tutorTeachingLicenseRelations = relations(
  tutorTeachingLicenses,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutorTeachingLicenses.tutorId],
      references: [tutors.tutorId],
    }),
  }),
);

export const educationTypeRelations = relations(educationTypes, ({ many }) => ({
  tutorEducations: many(tutorEducations),
}));
