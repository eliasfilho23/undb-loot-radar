import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './AuthService';
import { JwtGuard } from './guards/JwtGuard';
import { RepositoryModule } from '@/repository';

@Module({
  imports  : [ JwtModule.register({}), RepositoryModule ],
  providers: [ AuthService, JwtGuard ],
  exports  : [ AuthService, JwtGuard, JwtModule ],
})
export class AuthModule {}
