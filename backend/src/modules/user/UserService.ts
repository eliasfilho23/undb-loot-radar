import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/repository';
import { UserCreate } from '@/schemas';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: UserCreate) {
    return this.userRepository.create(dto);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
