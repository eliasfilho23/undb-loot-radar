import request from 'supertest';
import { DrizzleService } from '@/drizzle';
import { userTable, claimTable } from '@/drizzle/tables';

describe('Setup - Backend', () => {
  it('health check', async () => {
    const { status, body } = await request(testApp.getHttpServer()).get('/health');
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('truncate tables', async () => {
    const drizzle = testApp.get(DrizzleService);
    await drizzle.db.delete(claimTable);
    await drizzle.db.delete(userTable);
  });
});
