import { Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { Db, DrizzleService } from '@/drizzle';
import { userTable } from '@/drizzle/tables';
import { User, UserWithPassword } from '@/schemas';
import { randomUUID } from 'crypto';
import { LoggerService } from '@/logger';
import { ErrorCode, UserCreate } from '@/constants';
import { ConflictException } from '@nestjs/common';
import { DrizzleErrorHandler } from './impl/DrizzleErrorHandler';
import { UniqueConstraintDuplicatedKeyError } from './errors';

@Injectable()
export class UserRepository {
  private readonly db: Db;
  constructor(
    drizzle: DrizzleService,
    private readonly logger: LoggerService,
    private readonly drizzleErrorHandler: DrizzleErrorHandler,
  ) {
    this.db = drizzle.db;
  }

  async create(userToBeCreated: UserCreate): Promise<User> {
    const { username, email, password } = userToBeCreated;
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const [ user ] = await this.db
        .insert(userTable)
        .values({ id: randomUUID(), username, email, password: passwordHash })
        .returning();
      return User.parse(user);
    } catch (error) {
      const { error: typedError } = this.drizzleErrorHandler.handle(error);
      if (typedError instanceof UniqueConstraintDuplicatedKeyError) {
        throw new ConflictException({
          message  : 'Username ou email já está em uso.',
          errorCode: ErrorCode.User.AlreadyExists,
        });
      }
      this.logger.error('UserRepository.create failed', typedError);
      throw typedError;
    }
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id));
    if (!result[0]) {
      return null;
    }
    return User.parse(result[0]);
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(or(eq(userTable.email, email), eq(userTable.username, username)));
    return User.parse(result[0]) ?? null;
  }

  async findUserWithPassword(username: string): Promise<UserWithPassword | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username));
    return UserWithPassword.parse(result[0]) ?? null;
  }
}
