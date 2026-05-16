import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID, createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { eq, gt, and } from 'drizzle-orm';
import { DrizzleService, Db } from '@/drizzle';
import { refreshTokenTable } from '@/drizzle/tables';
import { UserRepository } from '@/repository';
import { ErrorCode } from '@/constants';

const ACCESS_TOKEN_EXPIRY  = '15m';
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly db: Db;

  constructor(
    drizzle        : DrizzleService,
    private readonly jwtService    : JwtService,
    private readonly configService : ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    this.db = drizzle.db;
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findUserWithPassword(username);
    if (!user || !user.password) {
      throw new UnauthorizedException({ message: 'Credenciais inválidas', errorCode: ErrorCode.Auth.InvalidCredentials });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException({ message: 'Credenciais inválidas', errorCode: ErrorCode.Auth.InvalidCredentials });
    }

    return this.issueTokenPair(user.id, user.username);
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException({ message: 'Sessão inválida', errorCode: ErrorCode.Auth.InvalidSession });
    }
    return { userId: user.id, username: user.username };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException({ message: 'Token de refresh ausente', errorCode: ErrorCode.Auth.MissingToken });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const now       = new Date();

    const [ stored ] = await this.db
      .select()
      .from(refreshTokenTable)
      .where(and(eq(refreshTokenTable.tokenHash, tokenHash), gt(refreshTokenTable.expiresAt, now)));

    if (!stored) {
      throw new UnauthorizedException({ message: 'Refresh token inválido ou expirado', errorCode: ErrorCode.Auth.InvalidToken });
    }

    const user = await this.userRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException({ message: 'Sessão inválida', errorCode: ErrorCode.Auth.InvalidSession });
    }

    await this.db.delete(refreshTokenTable).where(eq(refreshTokenTable.id, stored.id));

    return this.issueTokenPair(user.id, user.username);
  }

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await this.db.delete(refreshTokenTable).where(eq(refreshTokenTable.tokenHash, tokenHash));
  }

  private async issueTokenPair(userId: string, username: string) {
    const secret      = this.configService.get<string>('JWT_SECRET') ?? 'default-secret';
    const accessToken = this.jwtService.sign({ sub: userId, username }, { secret, expiresIn: ACCESS_TOKEN_EXPIRY });

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash       = hashToken(rawRefreshToken);
    const expiresAt       = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    await this.db.insert(refreshTokenTable).values({
      id       : randomUUID(),
      userId,
      tokenHash,
      expiresAt,
    });

    return { userId, username, accessToken, refreshToken: rawRefreshToken };
  }
}
