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
      baseURL?: string;
      prefix?: string;
      interceptors?: RequestInterceptor[];
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
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }
    return init;
  }

  private async fetchWithInterceptors(url: string, method: string, body: unknown): Promise<Response> {
    let init = this.createRequestInit(method, body);
    for (const interceptor of this.config.interceptors ?? []) {
      init = await interceptor({ url, method, init });
    }
    return fetch(url, init);
  }

  async safeCommand<TResponse = unknown, TBody = unknown>(
    args: SafeCommandArgs<TBody>,
  ): Promise<{ error?: ClientError; response?: ClientResponse<TResponse> }> {
    const method = (args.method ?? 'POST').toUpperCase();
    const url = this.urlFor(args.command);

    const res = await this.fetchWithInterceptors(url, method, args.body);

    const rawText = await res.text();
    const parsed = rawText ? (JSON.parse(rawText) as unknown) : undefined;
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

export const client = new ClientAxiosAdapter({ prefix: 'api' });
