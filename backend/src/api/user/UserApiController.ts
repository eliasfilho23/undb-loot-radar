import { Body, Param } from '@nestjs/common';
import { UserApiService } from './UserApiService';
import { ZodParser } from '@/zod';
import { Api } from '@/constants';
import { User, UserCreate, UserDocs } from '@/schemas';
import { ApiGet, ApiPost, Controller, OpenApi } from '@/decorators';
import { Public } from '@/modules/auth/decorators/Public';

@Controller('users')
export class UserApiController {
  constructor(
    private readonly userApiService: UserApiService,
    private readonly zodParser     : ZodParser,
  ) {}

  @ApiPost(Api.User.Create)
  @OpenApi(UserDocs.create)
  @Public()
  async create(@Body() body: unknown) {
    const dto = this.zodParser.parseOrBadRequest(UserCreate, body);
    const user = await this.userApiService.create(dto);
    return user;
  }

  @ApiGet(Api.User.Read)
  @OpenApi(UserDocs.findOne)
  findOne(@Param() params: string[]) {
    const id = params[0].split('=')[1];
    return this.userApiService.findOne(id);
  }
}
