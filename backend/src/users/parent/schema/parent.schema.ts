import {
  pgTable,
  integer,
  varchar,
  serial,
  timestamp,
  text,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Parent table - includes all user information directly
export const parents = pgTable('parents', {
  // Primary key
  parentId: serial('parent_id').primaryKey(),
  
  // User authentication information
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Personal information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  
  // Address information - direct fields without reference
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  role: varchar('role', { length: 50 }).default('parent').notNull(),
  // Parent preferences
  preferredSubjects: text('preferred_subjects'),
  preferred_communication: varchar('preferred_communication', { length: 50 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Children table - stores child accounts managed by parents
export const children = pgTable('children', {
  childId: serial('child_id').primaryKey(),
  parentId: integer('parent_id')
    .notNull()
    .references(() => parents.parentId, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  dateOfBirth: date('date_of_birth'),
  gradeLevelId: integer('grade_level_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations for the parents table
export const parentsRelations = relations(parents, ({ many }) => ({
  children: many(children),
}));

// Define relations for the children table
export const childrenRelations = relations(children, ({ one }) => ({
  parent: one(parents, {
    fields: [children.parentId],
    references: [parents.parentId],
  }),
})); 