import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    emailIdx: index('email_idx').on(table.email),
    tokenIdx: index('token_idx').on(table.token),
  };
});
