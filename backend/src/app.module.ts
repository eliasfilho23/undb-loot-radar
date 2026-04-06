import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/drizzle';
import { ZodModule } from '@/zod';
import { UserApiModule } from '@/api/user';
import { HealthController } from '@/health';

@Module({
  imports    : [ DrizzleModule, ZodModule, UserApiModule ],
  controllers: [ HealthController ],
})
export class AppModule {}
