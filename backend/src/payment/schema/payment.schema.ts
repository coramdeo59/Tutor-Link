import { InferSelectModel, relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  decimal, 
  integer,
  text,
  boolean
} from 'drizzle-orm/pg-core';

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

// Payments table schema
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  
  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('ETB'),
  description: text('description').notNull(),
  
  // Transaction details
  txRef: varchar('tx_ref', { length: 100 }).notNull().unique(), // Our internal reference
  chapaRefId: varchar('chapa_ref_id', { length: 100 }), // Chapa reference after payment
  redirectUrl: varchar('redirect_url', { length: 255 }), // Checkout URL from Chapa
  status: varchar('status', { length: 20 }).notNull().default(PaymentStatus.PENDING),
  
  // Customer information
  userId: integer('user_id').notNull(), // Foreign key to users table
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  
  // Relationships
  invoiceId: integer('invoice_id'), // Foreign key to invoices table (optional)
  tutoringSessionId: integer('tutoring_session_id'), // Foreign key to tutoring_sessions table (optional)

  // Webhook data (when received)
  webhookReceived: boolean('webhook_received').default(false),
  webhookData: text('webhook_data'), // JSON stringified webhook payload
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
});

// Invoice table schema (simplified, you'll expand this)
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').notNull(), // Foreign key to users table (parent)
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  dueDate: timestamp('due_date').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
});

// Session table schema (simplified, you'll expand this)
export const paymentSessions = pgTable('payment_sessions', {
  id: serial('id').primaryKey(),
  tutorId: integer('tutor_id').notNull(), // Foreign key to users table (tutor)
  childId: integer('child_id').notNull(), // Foreign key to children table
  subject: varchar('subject', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('scheduled'),
  invoiceId: integer('invoice_id'), // Foreign key to invoices table (optional)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships definition
export const paymentRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceRelations = relations(invoices, ({ many }) => ({
  payments: many(payments),
  sessions: many(paymentSessions),
}));

export const sessionRelations = relations(paymentSessions, ({ one }) => ({
  invoice: one(invoices, {
    fields: [paymentSessions.invoiceId],
    references: [invoices.id],
  }),
}));

// Types for use in application code
export type Payment = InferSelectModel<typeof payments>;
export type Invoice = InferSelectModel<typeof invoices>;
export type PaymentSession = InferSelectModel<typeof paymentSessions>;

// DTOs for payment creation
export interface CreatePaymentDTO {
  amount: number;
  currency?: string;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  invoiceId?: number;
  userId: number;
}

// Response types for Chapa API
export interface ChapaInitializeResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
    tx_ref: string;
    amount: string;
    currency: string;
  };
}

export interface ChapaVerifyResponse {
  status: string;
  message: string;
  data: {
    amount: string;
    currency: string;
    status: string;
    tx_ref: string;
    reference: string;
    first_name: string;
    last_name: string;
    email: string;
    customization: {
      title: string;
      description: string;
    };
  };
}

export interface WebhookPayload {
  tx_ref: string;
  ref_id: string;
  status: string;
}
