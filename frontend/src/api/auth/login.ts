import { safeRequest } from '@/core/client';

export async function login(body: { username: string; password: string }) {
  return safeRequest<{ userId: string; username: string }>('/api/auth/client-login', {
    method: 'POST',
    body  : JSON.stringify(body),
  });
}
