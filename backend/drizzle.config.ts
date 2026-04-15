import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

const env = dotenv.config({ path: '.env.development' });

export default defineConfig({
  dialect      : 'postgresql',
  dbCredentials: {
    host    : env.parsed?.DB_HOST || '',
    port    : parseInt(env.parsed?.DB_PORT || '5433', 10),
    user    : env.parsed?.DB_USER || '',
    password: env.parsed?.DB_PASSWORD || '',
    database: env.parsed?.DB_NAME || '',
    ssl :false
  },
  schema       : './src/drizzle/tables/index.ts',
  out          : './drizzle',
  breakpoints  : true,
  verbose      : true,
});
