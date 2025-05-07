import {
  pgTable,
  serial,
  varchar,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { relations } from 'drizzle-orm';

// Updated schema with proper null handling
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const states = pgTable(
  'states',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id),
    name: varchar('name', { length: 100 }).notNull(),
  },
  (table) => ({
    uniqueStateNameInCountry: uniqueIndex(
      'unique_state_name_in_country_idx',
    ).on(
      // Corrected unique index
      table.countryId,
      table.name,
    ),
  }),
);

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.userId),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  stateId: integer('state_id').references(() => states.id),
  postalCode: varchar('postal_code', { length: 20 }),
  countryId: integer('country_id').references(() => countries.id),
  phoneNumber: varchar('phone_number', { length: 50 }), // Added phoneNumber
});

// Add relations for tables defined in this file
export const countryRelations = relations(countries, ({ many }) => ({
  states: many(states),
  addresses: many(addresses),
}));

export const stateRelations = relations(states, ({ one, many }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
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
  country: one(countries, {
    fields: [addresses.countryId],
    references: [countries.id],
  }),
}));
