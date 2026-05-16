import { createHmac } from 'crypto';

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret';

function base64url(input: object | string): string {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return Buffer.from(str).toString('base64url');
}

export function generateTestJwt(sub: string, username: string): string {
  const header  = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const data      = `${base64url(header)}.${base64url(payload)}`;
  const signature = createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

// ---------------------------------------------------------------------------
// Cookie jar
// ---------------------------------------------------------------------------

export class CookieJar {
  private readonly store = new Map<string, string>();

  set(setCookieHeader: string) {
    const [pair] = setCookieHeader.split(';');
    const eqIdx  = pair.indexOf('=');
    const name   = pair.slice(0, eqIdx).trim();
    const value  = pair.slice(eqIdx + 1).trim();
    this.store.set(name, value);
  }

  get(name: string): string | undefined {
    return this.store.get(name);
  }

  toHeader(): string {
    return [...this.store.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  clear() {
    this.store.clear();
  }
}

export const cookieJar = new CookieJar();

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export type ClientError = {
  status: number;
  message: string;
  body?: unknown;
};

type SafeCommandArgs<TBody> = {
  command: string;
  body?: TBody;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
};

type ClientResponse<T> = {
  status: number;
  body: T;
};

const DEFAULT_BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

export type RequestInterceptor = (ctx: {
  url: string;
  method: string;
  init: RequestInit;
}) => RequestInit | Promise<RequestInit>;

export class ClientAxiosAdapter {
  constructor(
    private readonly config: {
      baseURL?     : string;
      prefix?      : string;
      interceptors?: RequestInterceptor[];
      jar?         : CookieJar;
    } = {},
  ) {}

  private get baseURL() {
    return (this.config.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  private get prefix() {
    return (this.config.prefix ?? 'api').replace(/^\/+|\/+$/g, '');
  }

  private urlFor(command: string) {
    const cmd = command.replace(/^\/+/, '');
    return `${this.baseURL}/${this.prefix}/${cmd}`;
  }

  private createRequestInit(method: string, body: unknown): RequestInit {
    const init: RequestInit = { method };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const jar = this.config.jar;
    if (jar) {
      const cookieHeader = jar.toHeader();
      if (cookieHeader) headers['Cookie'] = cookieHeader;
    }

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    init.headers = headers;
    return init;
  }

  private async fetchWithInterceptors(url: string, method: string, body: unknown): Promise<Response> {
    let init = this.createRequestInit(method, body);

    for (const interceptor of this.config.interceptors ?? []) {
      init = await interceptor({ url, method, init });
    }

    const response = await fetch(url, init);

    // Persiste cookies da resposta no jar
    const jar = this.config.jar;
    if (jar) {
      const rawSetCookie = response.headers.get('set-cookie');
      if (rawSetCookie) {
        // Node une múltiplos Set-Cookie com ', ' — split cuidadoso
        rawSetCookie.split(/,(?=\s*\w+=)/).forEach((c) => jar.set(c.trim()));
      }
    }

    return response;
  }

  async safeCommand<TResponse = unknown, TBody = unknown>(
    args: SafeCommandArgs<TBody>,
  ): Promise<{ error?: ClientError; response?: ClientResponse<TResponse> }> {
    const method = (args.method ?? 'POST').toUpperCase();
    const url    = this.urlFor(args.command);

    const res     = await this.fetchWithInterceptors(url, method, args.body);
    const rawText = await res.text();
    const parsed  = rawText ? (JSON.parse(rawText) as unknown) : undefined;

    if (!res.ok) {
      return {
        error: {
          status : res.status,
          message: (parsed as any)?.message ?? (parsed as any)?.error ?? `HTTP ${res.status}`,
          body   : parsed,
        },
      };
    }

    return {
      response: {
        status: res.status,
        body  : parsed as TResponse,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Instâncias exportadas
// ---------------------------------------------------------------------------

/** Sem autenticação — para rotas @Public() */
export const client = new ClientAxiosAdapter({ prefix: 'api' });

/** Com Bearer JWT gerado a partir de JWT_SECRET do .env */
export const authedClient = (sub: string, username: string) =>
  new ClientAxiosAdapter({
    prefix      : 'api',
    interceptors: [
      ({ init }) => ({
        ...init,
        headers: {
          ...(init.headers as Record<string, string>),
          Authorization: `Bearer ${generateTestJwt(sub, username)}`,
        },
      }),
    ],
  });

/** Com cookie jar — para fluxos que passam cookies entre requisições */
export const cookieClient = new ClientAxiosAdapter({ prefix: 'api', jar: cookieJar });
