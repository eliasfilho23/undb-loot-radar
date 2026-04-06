import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect      : 'postgresql',
  dbCredentials : { url: process.env.DATABASE_URL! },
  schema       : './src/drizzle/tables/index.ts',
  out          : './drizzle',
  breakpoints  : true,
  verbose      : true,
});
