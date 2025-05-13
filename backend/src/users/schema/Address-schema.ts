import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { users } from './User-schema';
import { relations } from 'drizzle-orm';

// State Table
export const states = pgTable('states', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
});

// City Table with State Relationship
export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  stateId: integer('state_id').references(() => states.id).notNull(),
});

// Address Table with Dual References
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.userId).notNull(),
  stateId: integer('state_id').references(() => states.id).notNull(),
  cityId: integer('city_id').references(() => cities.id).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
});

// Enhanced Relations
export const stateRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  addresses: many(addresses),
}));

export const cityRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  addresses: many(addresses),
}));

export const addressRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.userId],
  }),
  state: one(states, {
    fields: [addresses.stateId],
    references: [states.id],
  }),
  city: one(cities, {
    fields: [addresses.cityId],
    references: [cities.id],
  }),
}));