// import {
//   pgTable,
//   serial,
//   varchar,
//   integer,
//   timestamp,
//   text,
// } from 'drizzle-orm/pg-core';

// /**
//  * Database schema for grade levels
//  * Centralized table for all educational grade levels in the system
//  */
// export const gradeLevels = pgTable('grade_levels', {
//   gradeLevelId: serial('grade_level_id').primaryKey(),
//   name: varchar('name', { length: 100 }).notNull().unique(),

// });

// export const subjects = pgTable('subjects', {
//   subjectId: serial('subject_id').primaryKey(),
//   name: varchar('name', { length: 100 }).notNull().unique(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });
