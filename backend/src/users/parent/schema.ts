import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { studentParent } from '../students/schema';

// Relations
export const parentRelations = relations(users, ({ many }) => ({
  students: many(studentParent),
}));
