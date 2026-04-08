import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect      : 'postgresql',
  dbCredentials: {
    host    : process.env.DB_HOST || '',
    port    : parseInt(process.env.DB_PORT || '5433', 10),
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || '',
  },
  schema       : './src/drizzle/tables/index.ts',
  out          : './drizzle',
  breakpoints  : true,
  verbose      : true,
});
