import { Module } from '@nestjs/common';
import { GamesApiController } from './GamesApiController';
import { GamesApiService } from './GamesApiService';

@Module({
  controllers: [ GamesApiController ],
  providers  : [ GamesApiService ],
})
export class GamesApiModule {}
