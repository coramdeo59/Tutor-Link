import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { children } from '../../users/schema/parent-schema';
import { subjects } from '../../users/schema/SubjectGrade-schema';

// Tutors Table (for tutoring sessions)
export const tutors = pgTable('tutors', {
  tutorId: serial('tutor_id').primaryKey(),
  userId: integer('user_id').notNull(), // Reference to users table
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tutoring Sessions Table
export const tutoringSessions = pgTable('tutoring_sessions', {
  sessionId: serial('session_id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  tutorId: integer('tutor_id')
    .notNull()
    .references(() => tutors.tutorId, { onDelete: 'cascade' }),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  topic: varchar('topic', { length: 255 }),
  cancelled: boolean('cancelled').default(false),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Session Progress Table
export const sessionProgress = pgTable('session_progress', {
  progressId: serial('progress_id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId, { onDelete: 'cascade' }),
  progressPercentage: integer('progress_percentage').default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Achievements Table
export const achievements = pgTable('achievements', {
  achievementId: serial('achievement_id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  earnedDate: timestamp('earned_date').notNull().defaultNow(),
});

// Learning Hours Table
export const learningHours = pgTable('learning_hours', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.childId, { onDelete: 'cascade' }),
  subjectId: integer('subject_id')
    .notNull()
    .references(() => subjects.subjectId, { onDelete: 'cascade' }),
  hoursSpent: numeric('hours_spent').notNull(),
  sessionId: integer('session_id').references(
    () => tutoringSessions.sessionId,
    { onDelete: 'set null' },
  ),
  description: text('description'),
  weekStartDate: timestamp('week_start_date', { withTimezone: true }),
  totalHours: numeric('total_hours'),
  recordedDate: timestamp('recorded_date', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations definitions
export const tutorRelations = relations(tutors, ({ many }) => ({
  sessions: many(tutoringSessions),
}));

export const tutoringSessionRelations = relations(
  tutoringSessions,
  ({ one }) => ({
    tutor: one(tutors, {
      fields: [tutoringSessions.tutorId],
      references: [tutors.tutorId],
    }),
    child: one(children, {
      fields: [tutoringSessions.childId],
      references: [children.childId],
    }),
    subject: one(subjects, {
      fields: [tutoringSessions.subjectId],
      references: [subjects.subjectId],
    }),
  }),
);

export const sessionProgressRelations = relations(
  sessionProgress,
  ({ one }) => ({
    child: one(children, {
      fields: [sessionProgress.childId],
      references: [children.childId],
    }),
    subject: one(subjects, {
      fields: [sessionProgress.subjectId],
      references: [subjects.subjectId],
    }),
  }),
);

export const achievementsRelations = relations(achievements, ({ one }) => ({
  child: one(children, {
    fields: [achievements.childId],
    references: [children.childId],
  }),
}));

export const learningHoursRelations = relations(learningHours, ({ one }) => ({
  child: one(children, {
    fields: [learningHours.childId],
    references: [children.childId],
  }),
}));

// Dashboard settings for children to customize their dashboard experience
export const dashboardSettings = pgTable('dashboard_settings', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .unique()
    .references(() => children.childId, { onDelete: 'cascade' }),
  preferredSubjectIds: jsonb('preferred_subject_ids').$type<number[]>(),
  widgetPreferences: jsonb('widget_preferences').$type<{
    showUpcomingSessions?: boolean;
    showRecentAchievements?: boolean;
    showProgressSummary?: boolean;
    showLearningHours?: boolean;
  }>(),
  displayPreferences: jsonb('display_preferences').$type<{
    colorTheme?: string;
    layout?: string;
  }>(),
  pinnedItems: jsonb('pinned_items').$type<
    {
      type: string;
      id: number;
    }[]
  >(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations for dashboard settings
export const dashboardSettingsRelations = relations(
  dashboardSettings,
  ({ one }) => ({
    child: one(children, {
      fields: [dashboardSettings.childId],
      references: [children.childId],
    }),
  }),
);
