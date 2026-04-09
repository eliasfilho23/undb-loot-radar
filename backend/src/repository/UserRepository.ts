import { Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { Db, DrizzleService } from '@/drizzle';
import { userTable, UserTable } from '@/drizzle/tables';
import { User } from '@/schemas';
import { randomUUID } from 'crypto';
import { LoggerService } from '@/logger';
import { ErrorCode } from '@/constants';
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

  async create(userToBeCreated: User): Promise<UserTable> {
    const { username, email } = userToBeCreated;
    try {
      const [ user ] = await this.db
        .insert(userTable)
        .values({ id: randomUUID(), username, email })
        .returning();
      return user;
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

  async findById(id: string): Promise<UserTable | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id));
    return result[0] ?? null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<UserTable | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(or(eq(userTable.email, email), eq(userTable.username, username)));
    return result[0] ?? null;
  }
}
