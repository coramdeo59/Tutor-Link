import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const Country = pgTable('Country', {
  CountryID: serial('CountryID').primaryKey(),
  CountryName: varchar('CountryName', { length: 100 }).notNull(),
});

export const countryRelations = relations(Country, ({ many }) => ({
  provinces: many(Province),
}));

export const Province = pgTable('Province', {
  ProvinceID: serial('ProvinceID').primaryKey(),
  CountryID: integer('CountryID').references(() => Country.CountryID),
  ProvinceName: varchar('ProvinceName', { length: 100 }).notNull(),
});

export const provinceRelations = relations(Province, ({ one }) => ({
  country: one(Country, {
    fields: [Province.CountryID],
    references: [Country.CountryID],
  }),
}));

export const Address = pgTable('Address', {
  id: serial('AddressID').primaryKey(),
  AddressLine1: varchar('AddressLine1', { length: 255 }).notNull(),
  AddressLine2: varchar('AddressLine2', { length: 255 }),
  CountryID: integer('CountryID').references(() => Country.CountryID),
  ProvinceID: integer('ProvinceID').references(() => Province.ProvinceID),
  City: varchar('City', { length: 100 }).notNull(),
  Phone: varchar('Phone', { length: 20 }).notNull(),
  ZipCode: varchar('ZipCode', { length: 20 }).notNull(),
});

export const addressRelations = relations(Address, ({ one }) => ({
  country: one(Country, {
    fields: [Address.CountryID],
    references: [Country.CountryID],
  }),
  province: one(Province, {
    fields: [Address.ProvinceID],
    references: [Province.ProvinceID],
  }),
}));
