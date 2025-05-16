import { pgTable, serial, integer, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

/**
 * Different types of notifications that can be sent to users
 */
export enum NotificationType {
  SESSION_REMINDER = 'session_reminder',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_BOOKED = 'session_booked',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  TUTOR_APPROVED = 'tutor_approved',
  TUTOR_REJECTED = 'tutor_rejected',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_DUE = 'payment_due',
  CHILD_PROGRESS_UPDATE = 'child_progress_update',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

/**
 * Database schema for notifications
 */
export const notifications = pgTable('notifications', {
  notificationId: serial('notification_id').primaryKey(),
  userId: integer('user_id').notNull(), // The recipient user ID
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // Uses NotificationType values
  read: boolean('read').default(false),
  actionUrl: varchar('action_url', { length: 255 }), // Optional URL to direct user when clicking notification
  relatedEntityId: integer('related_entity_id'), // Optional ID of related entity (session, achievement, etc.)
  relatedEntityType: varchar('related_entity_type', { length: 50 }), // Type of related entity
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration date
});

/**
 * Type definition for notification records
 */
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert; 