import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { Pool } from 'pg';

export default async function globalSetup() {
  const pool = new Pool({
    host    : process.env.DB_HOST,
    port    : parseInt(process.env.DB_PORT ?? '5433', 10),
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await pool.query('DELETE FROM claims');
  await pool.query('DELETE FROM users');
  await pool.end();
}
