import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/repository';
import { User } from '@/schemas';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: User) {
    const existing = await this.userRepository.findByEmailOrUsername(dto.email, dto.username);

    if (existing) {
      throw new ConflictException('Username or email already in use');
    }

    return this.userRepository.create(dto);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
