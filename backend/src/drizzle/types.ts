import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './tables';

export type Db = NodePgDatabase<typeof schema>;
