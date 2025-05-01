import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { Country, Province } from '../addres/schema';


// TutorDetails Table
export const tutorDetails = pgTable('TutorDetails', {
  TutorID: integer('TutorID')
    .primaryKey()
    .references(() => users.UserID),
  BirthDate: date('BirthDate').notNull(),
  Certified: boolean('Certified').notNull(),
  Major: varchar('Major', { length: 100 }).notNull(),
  EducationInstitution: varchar('EducationInstitution', {
    length: 255,
  }).notNull(),
  GraduationYear: integer('GraduationYear').notNull(),
  WorkTitle: varchar('WorkTitle', { length: 100 }).notNull(),
  WorkInstitution: varchar('WorkInstitution', { length: 255 }).notNull(),
});

// TutorSubjectGrade Table
export const tutorSubjectGrade = pgTable(
  'TutorSubjectGrade',
  {
    TutorID: integer('TutorID')
      .notNull()
      .references(() => users.UserID),
    SubjectID: integer('SubjectID')
      .notNull()
      .references(() => subjects.SubjectID),
    GradeID: integer('GradeID')
      .notNull()
      .references(() => gradeLevels.GradeID),
  },
  (table) => {
    return {
      pk: primaryKey(table.TutorID, table.SubjectID, table.GradeID),
    };
  },
);

// TutorSubjects Table
export const TutorSubjects = pgTable(
  'TutorSubjects',
  {
    TutorID: integer('TutorID')
      .notNull()
      .references(() => users.UserID),
    SubjectID: integer('SubjectID')
      .notNull()
      .references(() => subjects.SubjectID),
    GradeID: integer('GradeID')
      .notNull()
      .references(() => gradeLevels.GradeID),
  },
  (table) => {
    return {
      pk: primaryKey(table.TutorID, table.SubjectID, table.GradeID),
    };
  },
);

// TutorWorkExperience Table
export const TutorWorkExperience = pgTable('TutorWorkExperience', {
  WorkExperienceID: serial('WorkExperienceID').primaryKey(),
  TutorID: integer('TutorID')
    .notNull()
    .references(() => users.UserID),
  WorkTitle: varchar('WorkTitle', { length: 100 }).notNull(),
  WorkInstitution: varchar('WorkInstitution', { length: 255 }).notNull(),
  StartDate: date('StartDate').notNull(),
  EndDate: date('EndDate'),
});

// TutorEducation Table
export const TutorEducation = pgTable('TutorEducation', {
  EducationID: serial('EducationID').primaryKey(),
  TutorID: integer('TutorID')
    .notNull()
    .references(() => users.UserID),
  Major: varchar('Major', { length: 100 }).notNull(),
  EducationInstitution: varchar('EducationInstitution', {
    length: 255,
  }).notNull(),
  GraduationYear: integer('GraduationYear').notNull(),
});

// TutorIDDocument Table
export const tutorIDDocument = pgTable('TutorIDDocument', {
  DocumentID: serial('DocumentID').primaryKey(),
  TutorID: integer('TutorID')
    .notNull()
    .references(() => users.UserID),
  PhotoFront: varchar('PhotoFront', { length: 255 }).notNull(),
  PhotoBack: varchar('PhotoBack', { length: 255 }).notNull(),
  CountryID: integer('CountryID')
    .notNull()
    .references(() => Country.CountryID),
  ProvinceID: integer('ProvinceID')
    .notNull()
    .references(() => Province.ProvinceID),
  Type: varchar('Type', { length: 50 }).notNull(),
  DocumentNumber: varchar('DocumentNumber', { length: 100 }).notNull(),
});

// TutorDegree Table
export const tutorDegree = pgTable('TutorDegree', {
  DegreeID: serial('DegreeID').primaryKey(),
  TutorID: integer('TutorID')
    .notNull()
    .references(() => users.UserID),
  Photo: varchar('Photo', { length: 255 }).notNull(),
  EducationTypeID: integer('EducationTypeID')
    .notNull()
    .references(() => educationType.EducationTypeID),
  StartDate: date('StartDate').notNull(),
  EndDate: date('EndDate').notNull(),
});

// TutorTeachingLicense Table
export const tutorTeachingLicense = pgTable('TutorTeachingLicense', {
  LicenseID: serial('LicenseID').primaryKey(),
  TutorID: integer('TutorID')
    .notNull()
    .references(() => users.UserID),
  Photo: varchar('Photo', { length: 255 }).notNull(),
  IssueBody: varchar('IssueBody', { length: 255 }).notNull(),
  IssuingCountryID: integer('IssuingCountryID')
    .notNull()
    .references(() => Country.CountryID),
  IssuerProvinceID: integer('IssuerProvinceID')
    .notNull()
    .references(() => Province.ProvinceID),
  Subtype: varchar('Subtype', { length: 50 }).notNull(),
  CertificationName: varchar('CertificationName', { length: 100 }).notNull(),
  SubjectArea: varchar('SubjectArea', { length: 100 }).notNull(),
  GradeLevel: varchar('GradeLevel', { length: 50 }).notNull(),
  IssueDate: date('IssueDate').notNull(),
  ExpirationDate: date('ExpirationDate').notNull(),
});

// Subjects table
export const subjects = pgTable('Subject', {
  SubjectID: serial('SubjectID').primaryKey(),
  SubjectName: varchar('SubjectName', { length: 100 }).notNull(),
});

// Grade levels table
export const gradeLevels = pgTable('Grade', {
  GradeID: serial('GradeID').primaryKey(),
  GradeName: varchar('GradeName', { length: 50 }).notNull(),
});

// Education Types table
export const educationType = pgTable('EducationType', {
  EducationTypeID: serial('EducationTypeID').primaryKey(),
  EducationTypeName: varchar('EducationTypeName', { length: 50 }).notNull(),
});

// Relations
export const tutorDetailsRelations = relations(tutorDetails, ({ one }) => ({
  user: one(users, {
    fields: [tutorDetails.TutorID],
    references: [users.UserID],
  }),
}));

export const tutorSubjectGradeRelations = relations(
  tutorSubjectGrade,
  ({ one }) => ({
    tutor: one(users, {
      fields: [tutorSubjectGrade.TutorID],
      references: [users.UserID],
    }),
    subject: one(subjects, {
      fields: [tutorSubjectGrade.SubjectID],
      references: [subjects.SubjectID],
    }),
    grade: one(gradeLevels, {
      fields: [tutorSubjectGrade.GradeID],
      references: [gradeLevels.GradeID],
    }),
  }),
);

// Relations for TutorSubjects
export const tutorSubjectsRelations = relations(TutorSubjects, ({ one }) => ({
  tutor: one(users, {
    fields: [TutorSubjects.TutorID],
    references: [users.UserID],
  }),
  subject: one(subjects, {
    fields: [TutorSubjects.SubjectID],
    references: [subjects.SubjectID],
  }),
  grade: one(gradeLevels, {
    fields: [TutorSubjects.GradeID],
    references: [gradeLevels.GradeID],
  }),
}));

// Relations for TutorWorkExperience
export const tutorWorkExperienceRelations = relations(
  TutorWorkExperience,
  ({ one }) => ({
    tutor: one(users, {
      fields: [TutorWorkExperience.TutorID],
      references: [users.UserID],
    }),
  }),
);

// Relations for TutorEducation
export const tutorEducationRelations = relations(TutorEducation, ({ one }) => ({
  tutor: one(users, {
    fields: [TutorEducation.TutorID],
    references: [users.UserID],
  }),
}));

export const tutorIDDocumentRelations = relations(
  tutorIDDocument,
  ({ one }) => ({
    tutor: one(users, {
      fields: [tutorIDDocument.TutorID],
      references: [users.UserID],
    }),
    country: one(Country, {
      fields: [tutorIDDocument.CountryID],
      references: [Country.CountryID],
    }),
    province: one(Province, {
      fields: [tutorIDDocument.ProvinceID],
      references: [Province.ProvinceID],
    }),
  }),
);

export const tutorDegreeRelations = relations(tutorDegree, ({ one }) => ({
  tutor: one(users, {
    fields: [tutorDegree.TutorID],
    references: [users.UserID],
  }),
  educationType: one(educationType, {
    fields: [tutorDegree.EducationTypeID],
    references: [educationType.EducationTypeID],
  }),
}));

export const tutorTeachingLicenseRelations = relations(
  tutorTeachingLicense,
  ({ one }) => ({
    tutor: one(users, {
      fields: [tutorTeachingLicense.TutorID],
      references: [users.UserID],
    }),
    issuingCountry: one(Country, {
      fields: [tutorTeachingLicense.IssuingCountryID],
      references: [Country.CountryID],
    }),
    issuerProvince: one(Province, {
      fields: [tutorTeachingLicense.IssuerProvinceID],
      references: [Province.ProvinceID],
    }),
  }),
);

export const subjectsRelations = relations(subjects, ({ many }) => ({
  tutors: many(tutorSubjectGrade),
}));

export const gradeLevelsRelations = relations(gradeLevels, ({ many }) => ({
  tutors: many(tutorSubjectGrade),
}));

export const educationTypeRelations = relations(educationType, ({ many }) => ({
  tutors: many(tutorDegree),
}));
