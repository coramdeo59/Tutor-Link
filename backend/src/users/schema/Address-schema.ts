import {
  pgTable,
  serial,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './User-schema';
import { relations } from 'drizzle-orm'; 


export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.userId),
  location: varchar('address_line_1', { length: 255 }).notNull(),
  state: varchar('state', { length: 100 }),
  city: varchar('city', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 50 }), 
  street: varchar('street', { length: 255 })
});


export const addressRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.userId],
  }),
}));