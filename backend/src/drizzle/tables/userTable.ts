import { uuid } from 'drizzle-orm/pg-core';
import { pgTable, text } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id      : uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  email   : text('email').notNull().unique(),
  password: text('password'),
});

export type UserTable = typeof userTable.$inferSelect;
