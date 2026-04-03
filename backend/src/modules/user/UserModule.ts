import { Module } from '@nestjs/common';
import { UserService } from './UserService';

@Module({
  providers: [ UserService ],
  exports  : [ UserService ],
})
export class UserModule {}
