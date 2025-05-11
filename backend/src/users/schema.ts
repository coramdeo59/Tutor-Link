import {
  pgTable,
  varchar,
  integer,
  serial,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { addresses } from './address/schema';
import { relations } from 'drizzle-orm';
import { students } from './students/schema';
import { tutors } from './tutors/schema';

export const roleEnum = pgEnum('role_enum', ['admin', 'regular']);

export const userTypeEnum = pgEnum('user_type_enum', [
  'tutor',
  'student',
  'parent',
]);

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  addressId: integer('address_id')
    .notNull()
    .references(() => addresses.id),
  userType: userTypeEnum('user_type').notNull(),
  role: roleEnum('role').notNull().default('regular'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  address: one(addresses, {
    fields: [users.addressId],
    references: [addresses.id],
  }),
  student: one(students, {
    fields: [users.userId],
    references: [students.studentId],
  }),
  tutor: one(tutors, {
    fields: [users.userId],
    references: [tutors.tutorId],
  }),
}));
