import { Body, HttpCode, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService, CurrentUser } from '@/modules/auth';
import type { CurrentUserPayload } from '@/modules/auth';
import { Public } from '@/modules/auth/decorators/Public';
import { ZodParser } from '@/zod';
import { Api, AuthDocs, LoginBody } from '@/constants';
import { ApiGet, ApiPost, Controller, OpenApi } from '@/decorators';

const ACCESS_COOKIE_MAX_AGE  = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly zodParser  : ZodParser,
  ) {}

  @ApiPost(Api.Auth.ClientLogin)
  @OpenApi(AuthDocs.login)
  @HttpCode(200)
  @Public()
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password } = this.zodParser.parseOrBadRequest(LoginBody, body);
    const { userId, username: uname, accessToken, refreshToken } = await this.authService.login(username, password);

    res.cookie('access_token', accessToken, {
      httpOnly: false,
      maxAge  : ACCESS_COOKIE_MAX_AGE,
      path    : '/',
      sameSite: 'lax',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge  : REFRESH_COOKIE_MAX_AGE,
      path    : '/',
      sameSite: 'lax',
    });

    return { userId, username: uname };
  }

  @ApiGet(Api.Auth.Me)
  @OpenApi(AuthDocs.me)
  async me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user.userId);
  }

  @ApiPost(Api.Auth.RefreshCookie)
  @OpenApi(AuthDocs.refresh)
  @HttpCode(200)
  @Public()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies['refresh_token'] as string | undefined;
    const { userId, username, accessToken, refreshToken } = await this.authService.refresh(rawRefreshToken ?? '');

    res.cookie('access_token', accessToken, {
      httpOnly: false,
      maxAge  : ACCESS_COOKIE_MAX_AGE,
      path    : '/',
      sameSite: 'lax',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge  : REFRESH_COOKIE_MAX_AGE,
      path    : '/',
      sameSite: 'lax',
    });

    return { userId, username };
  }

  @ApiPost(Api.Auth.ClientLogout)
  @OpenApi(AuthDocs.logout)
  @HttpCode(200)
  @Public()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies['refresh_token'] as string | undefined;
    await this.authService.logout(rawRefreshToken);

    res.clearCookie('access_token',  { path: '/' });
    res.clearCookie('refresh_token', { path: '/', httpOnly: true });

    return {};
  }
}
