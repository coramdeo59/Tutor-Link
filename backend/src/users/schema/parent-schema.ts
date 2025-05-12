import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './User-schema';
import { gradeLevels } from './SubjectGrade-schema';

// Parents Table
export const parents = pgTable('parents', {
  parentId: integer('parent_id')
    .primaryKey()
    .references(() => users.userId, { onDelete: 'cascade' }),
});

// Children Table
export const children = pgTable('children', {
  childId: serial('child_id').primaryKey(),
  parentId: integer('parent_id')
    .notNull()
    .references(() => parents.parentId, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gradeLevelId: integer('grade_level_id').references(
    () => gradeLevels.gradeId,
    { onDelete: 'set null' },
  ),
  userId: integer('user_id').references(() => users.userId, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const parentRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.parentId],
    references: [users.userId],
  }),
  children: many(children),
}));

export const childRelations = relations(children, ({ one }) => ({
  parent: one(parents, {
    fields: [children.parentId],
    references: [parents.parentId],
  }),
  user: one(users, {
    fields: [children.userId],
    references: [users.userId],
  }),
  gradeLevel: one(gradeLevels, {
    fields: [children.gradeLevelId],
    references: [gradeLevels.gradeId],
  }),
}));
