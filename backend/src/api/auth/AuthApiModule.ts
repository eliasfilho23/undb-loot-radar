import { Module } from '@nestjs/common';
import { AuthApiController } from './AuthApiController';
import { AuthModule } from '@/modules/auth';

@Module({
  imports    : [ AuthModule ],
  controllers: [ AuthApiController ],
})
export class AuthApiModule {}
