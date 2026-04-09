import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './tables';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db: NodePgDatabase<typeof schema>;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({
      host    : this.config.get<string>('DB_HOST'),
      port    : parseInt(this.config.get<string>('DB_PORT') ?? '5433', 10),
      user    : this.config.get<string>('DB_USER'),
      password: this.config.get<string>('DB_PASSWORD'),
      database: this.config.get<string>('DB_NAME'),
    });
    this.db = drizzle(this.pool, { schema });
    Logger.log(this.config.get<string>('DB_HOST'), this.config.get<string>('DB_PORT'), this.config.get<string>('DB_USER'), this.config.get<string>('DB_PASSWORD'), this.config.get<string>('DB_NAME'));
    Logger.log('DrizzleService initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
