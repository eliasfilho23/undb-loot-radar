import { Body, Param } from '@nestjs/common';
import { UserApiService } from './UserApiService';
import { ZodParser } from '@/zod';
import { Api } from '@/constants';
import { User, UserDocs } from '@/schemas';
import { ApiGet, ApiPost, Controller, OpenApi } from '@/decorators';

@Controller('users')
export class UserApiController {
  constructor(
    private readonly userApiService: UserApiService,
    private readonly zodParser     : ZodParser,
  ) {}

  @ApiPost(Api.User.Create)
  @OpenApi(UserDocs.create)
  async create(@Body() body: unknown) {
    const user = this.zodParser.parseOrBadRequest(User, body);
    return this.userApiService.create(user);
  }

  @ApiGet(Api.User.Read)
  @OpenApi(UserDocs.findOne)
  findOne(@Param() params: string[]) {
    const id = params[0].split('=')[1];
    return this.userApiService.findOne(id);
  }
}
