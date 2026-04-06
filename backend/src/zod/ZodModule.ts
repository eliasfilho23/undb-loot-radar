import { Global, Module } from '@nestjs/common';
import { ZodParser } from './ZodParser';

@Global()
@Module({
  providers: [ ZodParser ],
  exports  : [ ZodParser ],
})
export class ZodModule {}
