import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '@/prisma';
import { ZodModule } from '@/zod';
import { UserApiModule } from '@/api/user';
import { HealthController } from '@/health';

@Module({
  imports    : [ TerminusModule, PrismaModule, ZodModule, UserApiModule ],
  controllers: [ HealthController ],
})
export class AppModule {}
