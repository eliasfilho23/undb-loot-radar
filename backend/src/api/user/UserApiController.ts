import { Body } from '@nestjs/common';
import { UserApiService } from './UserApiService';
import { ZodParser } from '@/zod';
import { Command } from '@/constants';
import { User, UserDocs } from '@/schemas';
import { CommandGet, CommandPost, Controller, OpenApi } from '@/decorators';

@Controller('users')
export class UserApiController {
  constructor(
    private readonly userApiService: UserApiService,
    private readonly zodParser     : ZodParser,
  ) {}

  @CommandPost(Command.User.Create)
  @OpenApi(UserDocs.create)
  async create(@Body() body: unknown) {
    const user = this.zodParser.parseOrBadRequest(User, body);
    return this.userApiService.create(user);
  }

  @CommandGet(Command.User.Read)
  @OpenApi(UserDocs.findOne)
  findOne(@Body() body: { id: string }) {
    return this.userApiService.findOne(body.id);
  }

  @CommandGet(Command.User.List)
  @OpenApi(UserDocs.findAll)
  findAll() {
    return this.userApiService.findAll();
  }
}
