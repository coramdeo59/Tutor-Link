import {
  pgTable,
  varchar,
  integer,
  serial,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tutors } from './Tutor-schema';
import { cities, states } from './Address-schema';

export const roleEnum = pgEnum('role_enum', ['admin', 'regular']);
export const userTypeEnum = pgEnum('user_type_enum', ['tutor', 'parent', 'admin']);

export const users = pgTable('users', {
  userId: serial('userId').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('firstName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  // profilePictureUrl field removed as it doesn't exist in the database
  stateId: integer('stateId') // Added stateId
    .references(() => states.id)
    .notNull(),
  cityId: integer('cityId') // Added cityId
    .references(() => cities.id)
    .notNull(),
  phoneNumber: varchar('phoneNumber', { length: 50 }).notNull(),
  userType: userTypeEnum('userType').notNull(),
  role: roleEnum('role').notNull().default('regular'),
  // lastLoginAt field removed as it doesn't exist in the database
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  state: one(states, {
    fields: [users.stateId],
    references: [states.id],
  }),
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
  tutor: one(tutors, {
    fields: [users.userId],
    references: [tutors.tutorId],
  }),
}));
