import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './User-schema';

export const states = pgTable('states', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  stateId: integer('stateId')
    .references(() => states.id)
    .notNull(),
});

export const stateRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  users: many(users),
}));

export const cityRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  users: many(users),
}));
