import { pgTable, serial, integer, text, timestamp, boolean, varchar, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../../users/schema/User-schema';

// Define message attachment types enum
export const attachmentTypeEnum = pgEnum('attachment_type', [
  'image',
  'document',
  'audio',
  'video',
  'other'
]);

/**
 * Database schema for conversations
 * A conversation is between two or more users
 */
export const conversations = pgTable('conversations', {
  conversationId: serial('conversation_id').primaryKey(),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  isGroupChat: boolean('is_group_chat').default(false),
  // For group chats only
  createdBy: integer('created_by').references(() => users.userId), // user ID of creator
  isDeleted: boolean('is_deleted').default(false),
});

// Define relations for conversations
export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

/**
 * Database schema for conversation participants
 * Links users to conversations they are participating in
 */
export const conversationParticipants = pgTable('conversation_participants', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.conversationId),
  userId: integer('user_id').notNull().references(() => users.userId),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'), // Null if still in conversation
  isAdmin: boolean('is_admin').default(false),
  lastReadAt: timestamp('last_read_at'), // Last time the user read messages in this conversation
});

// Define relations for conversation participants
export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.conversationId],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.userId],
  }),
}));

/**
 * Database schema for messages
 */
export const messages = pgTable('messages', {
  messageId: serial('message_id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.conversationId),
  senderId: integer('sender_id').notNull().references(() => users.userId), // user ID of sender
  content: text('content'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false),
  // JSON column for attachments (files, images, etc.)
  attachments: jsonb('attachments'),
  // Optional reference to a message this is replying to
  replyToId: integer('reply_to_message_id').references(() => messages.messageId),
});

// Define relations for messages
export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.conversationId],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.userId],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.messageId],
  }),
  readReceipts: many(messageReadReceipts),
}));

/**
 * Database schema for message read receipts
 * Tracks which users have read which messages
 */
export const messageReadReceipts = pgTable('message_read_receipts', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => messages.messageId),
  userId: integer('user_id').notNull().references(() => users.userId),
  readAt: timestamp('read_at').defaultNow().notNull(),
});

// Define relations for message read receipts
export const messageReadReceiptsRelations = relations(messageReadReceipts, ({ one }) => ({
  message: one(messages, {
    fields: [messageReadReceipts.messageId],
    references: [messages.messageId],
  }),
  user: one(users, {
    fields: [messageReadReceipts.userId],
    references: [users.userId],
  }),
}));

/**
 * Type definitions for file attachments
 */
export interface FileAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

/**
 * Type definitions for the schemas
 */
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert; 