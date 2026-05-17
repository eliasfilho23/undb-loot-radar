import { Query } from '@nestjs/common';
import { ApiGet, Controller } from '@/decorators';
import { Api } from '@/constants';
import { Public } from '@/modules/auth/decorators/Public';
import { GamesApiService } from './GamesApiService';

@Controller('games')
export class GamesApiController {
  constructor(private readonly gamesApiService: GamesApiService) {}

  @ApiGet(Api.Game.List)
  @Public()
  list(
    @Query('platform') platform?: string,
    @Query('type') type?: string,
  ) {
    return this.gamesApiService.list(platform, type);
  }
}
