import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from './userTable';

export const claimTable = pgTable('claims', {
  id              : text('id').primaryKey(),
  userId          : text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  gamerPowerItemId: integer('gamer_power_item_id').notNull(),
  title           : text('title').notNull(),
  claimedAt       : timestamp('claimed_at').notNull().defaultNow(),
});

export type ClaimTable = typeof claimTable.$inferSelect;
