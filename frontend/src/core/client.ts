const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError {
  constructor(
    public readonly status: number,
    public readonly body : any,
  ) {}

  get message(): string {
    if (Array.isArray(this.body?.message)) {
      const first = this.body.message[0];
      if (typeof first === 'string') return first;
      if (first?.message) return first.message;
    }
    return this.body?.message ?? `Erro ${this.status}`;
  }
}

type SafeResult<T> =
  | { error: ApiError;    response: undefined }
  | { error: undefined;   response: { status: number; body: T } }

export async function safeRequest<T>(
  path   : string,
  options: RequestInit = {},
): Promise<SafeResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      return { error: new ApiError(response.status, body), response: undefined };
    }

    return { error: undefined, response: { status: response.status, body: body as T } };
  } catch {
    return {
      error   : new ApiError(0, { message: 'Servidor indisponível. Tente novamente em alguns instantes.' }),
      response: undefined,
    };
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `Erro ${response.status}`);
  }

  return response.json() as Promise<T>;
}
