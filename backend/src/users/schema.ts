import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  integer,
  serial,
  date,
  boolean,
} from 'drizzle-orm/pg-core';
import { Address } from './addres/schema';
import { relations } from 'drizzle-orm';
import { Role } from './enums/role-enums';

export const userTypeEnum = pgEnum('user_type', ['tutor', 'student', 'parent']);

export const users = pgTable('User', {
  UserID: serial('UserID').primaryKey(),
  Email: varchar('Email', { length: 255 }).notNull().unique(),
  Password: varchar('Password', { length: 255 }).notNull(),
  FirstName: varchar('FirstName', { length: 100 }).notNull(),
  LastName: varchar('LastName', { length: 100 }).notNull(),
  UserType: userTypeEnum('UserType').notNull(),
  Photo: varchar('Photo', { length: 255 }),
  AddressID: integer('AddressID')
    .notNull()
    .references(() => Address.id),
  CreatedAt: timestamp('CreatedAt').defaultNow(),
  Role: varchar('Role', { length: 50 }).default(Role.Regular),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  address: one(Address, {
    fields: [users.AddressID],
    references: [Address.id],
  }),
}));

// TutorDetails Table
export const tutorDetails = pgTable('TutorDetails', {
    TutorID: integer('TutorID').primaryKey().references(() => users.UserID),
    BirthDate: date('BirthDate').notNull(),
    Certified: boolean('Certified').notNull(),
    Major: varchar('Major', { length: 100 }).notNull(),
    EducationInstitution: varchar('EducationInstitution', { length: 255 }).notNull(),
    GraduationYear: integer('GraduationYear').notNull(),
    WorkTitle: varchar('WorkTitle', { length: 100 }).notNull(),
    WorkInstitution: varchar('WorkInstitution', { length: 255 }).notNull(),
});
