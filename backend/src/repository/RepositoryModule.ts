import { Module } from '@nestjs/common';
import { UserRepository } from './UserRepository';
import { DrizzleErrorHandler } from './impl/DrizzleErrorHandler';
import { LoggerService } from '@/logger';

@Module({
  providers: [ DrizzleErrorHandler, UserRepository, LoggerService ],
  exports  : [ UserRepository ],
})
export class RepositoryModule {}
