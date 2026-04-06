import { Module } from '@nestjs/common';
import { UserService } from './UserService';
import { RepositoryModule } from '@/repository';

@Module({
  imports  : [ RepositoryModule ],
  providers: [ UserService ],
  exports  : [ UserService ],
})
export class UserModule {}
