import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserApiService } from './UserApiService';
import { ZodParser } from '@/zod';
import { User } from '@/schemas';

@Controller('users')
export class UserApiController {
  constructor(
    private readonly userApiService: UserApiService,
    private readonly zodParser     : ZodParser,
  ) {}

  @Post()
  async create(@Body() body: unknown) {
    const user = this.zodParser.parseOrBadRequest(User, body);
    return this.userApiService.create(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userApiService.findOne(id);
  }

  @Get()
  findAll() {
    return this.userApiService.findAll();
  }
}
