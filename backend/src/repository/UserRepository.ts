import { Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { Db, DrizzleService } from '@/drizzle';
import { userTable, UserTable } from '@/drizzle/tables';
import { User } from '@/schemas';
import { randomUUID } from 'crypto';

@Injectable()
export class UserRepository {
  private readonly db: Db;

  constructor(drizzle: DrizzleService) {
    this.db = drizzle.db;
  }

  async create(dto: User): Promise<UserTable> {
    const [ user ] = await this.db
      .insert(userTable)
      .values({ id: randomUUID(), username: dto.username, email: dto.email })
      .returning();
    return user;
  }

  async findAll(): Promise<Pick<UserTable, 'id' | 'username' | 'email' | 'createdAt'>[]> {
    return this.db
      .select({ id: userTable.id, username: userTable.username, email: userTable.email, createdAt: userTable.createdAt })
      .from(userTable);
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
