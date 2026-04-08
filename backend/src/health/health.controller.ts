import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DrizzleService } from '@/drizzle';
import { sql } from 'drizzle-orm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status do sistema' })
  @ApiResponse({ status: 200, description: 'Sistema operacional', schema: { example: { status: 'ok' } } })
  @ApiResponse({ status: 503, description: 'Banco de dados inacessível' })
  async check() {
    await this.drizzle.db.execute(sql`SELECT 1`);
    return { status: 'ok' };
  }
}
