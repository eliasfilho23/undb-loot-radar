import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { DrizzleService } from '@/drizzle';
import { claimTable, userTable } from '@/drizzle/tables';
import { setApp } from './app-instance';

export default async function globalSetup() {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  await app.listen(0); // bind to a random available port

  const url = await app.getUrl();
  process.env.TEST_BASE_URL = url;

  setApp(app);

  // Truncate tables before test run (previously in 00-backend.spec.ts)
  const drizzle = app.get(DrizzleService);
  await drizzle.db.delete(claimTable);
  await drizzle.db.delete(userTable);
}
