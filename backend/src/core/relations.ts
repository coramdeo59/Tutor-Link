import { relations } from 'drizzle-orm';
import * as userSchema from '../users/schema';
import * as addressSchema from '../users/address/schema';
import * as studentSchema from '../users/students/schema';
// Import tutorSchema if/when it's created and has relations
// import * as tutorSchema from '../users/tutors/schema';

// Relations from userSchema
export const userRelations = relations(userSchema.users, ({ one, many }) => ({
  address: one(addressSchema.addresses, {
    fields: [userSchema.users.addressId],
    references: [addressSchema.addresses.id],
  }),
  students: many(studentSchema.students), // Assuming students table has a FK to users
  // tutors: many(tutorSchema.tutors), // Assuming tutors table has a FK to users
}));

// Relations from addressSchema
export const countryRelations = relations(
  addressSchema.countries,
  ({ many }) => ({
    states: many(addressSchema.states),
    addresses: many(addressSchema.addresses),
  }),
);

export const stateRelations = relations(
  addressSchema.states,
  ({ one, many }) => ({
    country: one(addressSchema.countries, {
      fields: [addressSchema.states.countryId],
      references: [addressSchema.countries.id],
    }),
    addresses: many(addressSchema.addresses),
  }),
);

export const addressRelations = relations(
  addressSchema.addresses,
  ({ one }) => ({
    user: one(userSchema.users, {
      fields: [addressSchema.addresses.userId],
      references: [userSchema.users.userId],
    }),
    state: one(addressSchema.states, {
      fields: [addressSchema.addresses.stateId],
      references: [addressSchema.states.id],
    }),
    country: one(addressSchema.countries, {
      fields: [addressSchema.addresses.countryId],
      references: [addressSchema.countries.id],
    }),
  }),
);

// Relations from studentSchema
export const studentRelations = relations(
  studentSchema.students,
  ({ one }) => ({
    user: one(userSchema.users, {
      fields: [studentSchema.students.studentId], // Corrected from userId to studentId
      references: [userSchema.users.userId],
    }),
    // Add other relations for students if any (e.g., parent, gradeLevel)
  }),
);

// Add relations from tutorSchema if/when it's created
// export const tutorRelations = relations(tutorSchema.tutors, ({ one }) => ({
//   user: one(userSchema.users, {
//     fields: [tutorSchema.tutors.userId],
//     references: [userSchema.users.userId],
//   }),
// }));

// Combine all relations into a single export for Drizzle
export const allRelations = {
  ...userRelations,
  ...countryRelations,
  ...stateRelations,
  ...addressRelations,
  ...studentRelations,
  // ...tutorRelations,
};
