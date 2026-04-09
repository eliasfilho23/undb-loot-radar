import path from 'path';
import { defineConfig } from '@playwright/test';

// Expose backend node_modules to module resolution so global setup can import NestJS
const backendModules = path.resolve(__dirname, '../backend/node_modules');
process.env.NODE_PATH = process.env.NODE_PATH
  ? `${process.env.NODE_PATH}${path.delimiter}${backendModules}`
  : backendModules;
// @ts-ignore — private API, but reliable across Node versions
require('module')._initPaths();

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  globalSetup: './playwright-global-setup.ts',
  globalTeardown: './playwright-global-teardown.ts',
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  timeout: 30_000,
  // API-only tests — no browser needed
  projects: [{ name: 'api' }],
});
