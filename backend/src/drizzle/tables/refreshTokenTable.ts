import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './userTable';

export const refreshTokenTable = pgTable('refresh_tokens', {
  id        : uuid('id').primaryKey(),
  userId    : uuid('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  tokenHash : text('token_hash').notNull().unique(),
  expiresAt : timestamp('expires_at').notNull(),
  createdAt : timestamp('created_at').notNull().defaultNow(),
});

export type RefreshTokenTable = typeof refreshTokenTable.$inferSelect;
