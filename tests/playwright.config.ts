import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  globalSetup: './playwright-global-setup.ts',
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  timeout: 30_000,
  // webServer: {
  //   command: 'npm run dev',
  //   url    : process.env.TEST_BASE_WEB_URL ?? 'http://localhost:3020',
  //   cwd    : path.resolve(__dirname, '../frontend'),
  //   reuseExistingServer: true,
  //   env: { ...process.env as Record<string, string> },
  // },
  // API-only tests — no browser needed
  projects: [{ name: 'api' }],
});
