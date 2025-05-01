import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { subjects, gradeLevels } from '../tutors/schema';


export const studentSubjectGrade = pgTable(
  'StudentSubjectGrade',
  {
    StudentID: integer('StudentID')
      .notNull()
      .references(() => users.UserID),
    SubjectID: integer('SubjectID')
      .notNull()
      .references(() => subjects.SubjectID),
    GradeID: integer('GradeID')
      .notNull()
      .references(() => gradeLevels.GradeID),
  },
  (table) => {
    return {
      pk: primaryKey(table.StudentID, table.SubjectID, table.GradeID),
    };
  },
);


export const studentParent = pgTable(
  'StudentParent',
  {
    StudentID: integer('StudentID')
      .notNull()
      .references(() => users.UserID),
    ParentID: integer('ParentID')
      .notNull()
      .references(() => users.UserID),
  },
  (table) => {
    return {
      pk: primaryKey(table.StudentID, table.ParentID),
    };
  },
);


export const studentSubjectGradeRelations = relations(
  studentSubjectGrade,
  ({ one }) => ({
    student: one(users, {
      fields: [studentSubjectGrade.StudentID],
      references: [users.UserID],
    }),
    subject: one(subjects, {
      fields: [studentSubjectGrade.SubjectID],
      references: [subjects.SubjectID],
    }),
    grade: one(gradeLevels, {
      fields: [studentSubjectGrade.GradeID],
      references: [gradeLevels.GradeID],
    }),
  }),
);

export const studentParentRelations = relations(studentParent, ({ one }) => ({
  student: one(users, {
    fields: [studentParent.StudentID],
    references: [users.UserID],
  }),
  parent: one(users, {
    fields: [studentParent.ParentID],
    references: [users.UserID],
  }),
}));
