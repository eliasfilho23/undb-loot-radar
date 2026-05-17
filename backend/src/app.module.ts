import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DrizzleModule } from '@/drizzle';
import { ZodModule } from '@/zod';
import { UserApiModule } from '@/api/user';
import { AuthApiModule } from '@/api/auth';
import { GamesApiModule } from '@/api/games';
import { DealsApiModule } from '@/api/deals';
import { ClaimsApiModule } from '@/api/claims';
import { AuthModule } from '@/modules/auth';
import { JwtGuard } from '@/modules/auth/guards/JwtGuard';
import { HealthController } from '@/health';

const envDir = join(__dirname, '..', '..');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal   : true,
      envFilePath: [
        join(envDir, `.env.${process.env.NODE_ENV?.toLowerCase() ?? 'development'}`),
        join(envDir, '.env'),
      ],
    }),
    DrizzleModule,
    ZodModule,
    AuthModule,
    UserApiModule,
    AuthApiModule,
    GamesApiModule,
    DealsApiModule,
    ClaimsApiModule,
  ],
  controllers: [ HealthController ],
  providers  : [
    { provide: APP_GUARD, useClass: JwtGuard },
  ],
})
export class AppModule {}
