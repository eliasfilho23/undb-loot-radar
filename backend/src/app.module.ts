import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@/drizzle';
import { ZodModule } from '@/zod';
import { UserApiModule } from '@/api/user';
import { HealthController } from '@/health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal   : true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), '.env.development'),
      ],
      expandVariables: true,
    }),
    DrizzleModule,
    ZodModule,
    UserApiModule,
  ],
  controllers: [ HealthController ],
})
export class AppModule {}
