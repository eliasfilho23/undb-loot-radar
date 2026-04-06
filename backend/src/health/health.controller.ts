import { Controller, Get } from '@nestjs/common';
import { DrizzleService } from '@/drizzle';
import { sql } from 'drizzle-orm';

@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  async check() {
    await this.drizzle.db.execute(sql`SELECT 1`);
    return { status: 'ok' };
  }
}
