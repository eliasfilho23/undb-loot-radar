import { Global, Module } from '@nestjs/common';
import { ClsModule as ClsModuleNest } from 'nestjs-cls';
import { ClsService } from './cls.service';

@Global()
@Module({
  imports  : [ ClsModuleNest.forRoot({ middleware: { mount: true } }) ],
  providers: [ ClsService ],
  exports  : [ ClsService ],
})
export class ClsModule {}
