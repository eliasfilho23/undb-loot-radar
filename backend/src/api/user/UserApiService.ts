import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user';
import { User } from '@/schemas';

@Injectable()
export class UserApiService {
  constructor(private readonly userService: UserService) {}

  async create(data: User) {
    return this.userService.create(data);
  }

  async findAll() {
    return this.userService.findAll();
  }

  async findOne(id: string) {
    return this.userService.findOne(id);
  }
}
