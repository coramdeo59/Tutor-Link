import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InferSelectModel} from 'drizzle-orm';


// Admin table - focused on system control capabilities
export const admin = pgTable('admin', {
  // Primary key
  adminId: serial('admin_id').primaryKey(),
  
  // Authentication information
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Basic personal information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),

  
  // Contact (optional for admins)
  phoneNumber: varchar('phone_number', { length: 50 }),
  
  // Admin-specific fields
  role: varchar('role', { length: 50 }).default('admin').notNull(), // e.g., 'admin', 'super_admin', 'moderator'
  
  
  // Security and access contr
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});




// Export types for TypeScript
export type Admin = InferSelectModel<typeof admin>;
