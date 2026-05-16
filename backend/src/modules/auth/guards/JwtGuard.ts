import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '@/constants';
import { IS_PUBLIC_KEY } from '../decorators/Public';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService   : JwtService,
    private readonly configService: ConfigService,
    private readonly reflector    : Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request    = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ message: 'Token não fornecido', errorCode: ErrorCode.Auth.MissingToken });
    }

    const token  = authHeader.slice(7);
    const secret = this.configService.get<string>('JWT_SECRET') ?? 'default-secret';

    try {
      const payload = this.jwtService.verify<{ sub: string; username: string }>(token, { secret });
      request.user  = { userId: payload.sub, username: payload.username };
      return true;
    } catch {
      throw new UnauthorizedException({ message: 'Token inválido ou expirado', errorCode: ErrorCode.Auth.InvalidToken });
    }
  }
}
