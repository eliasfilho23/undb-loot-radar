import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/Public';
import { DrizzleService } from '@/drizzle';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Verificar status do sistema' })
  @ApiResponse({ status: 200, description: 'Sistema operacional', schema: { example: { status: 'ok' } } })
  @ApiResponse({ status: 503, description: 'Banco de dados inacessível' })
  async check() {
    return { status: 'ok' };
  }
}
