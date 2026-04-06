import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id       : text('id').primaryKey(),
  username : text('username').notNull().unique(),
  email    : text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type UserTable = typeof userTable.$inferSelect;
