import { Global, Module } from '@nestjs/common';
import { ClsModule, ClsService } from '@/cls';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports  : [ ClsModule ],
  providers: [
    {
      provide   : LoggerService,
      useFactory: (cls: ClsService) => new LoggerService('App', cls),
      inject    : [ ClsService ],
    },
  ],
  exports: [ LoggerService ],
})
export class LoggerModule {}
