import { authedSafeRequest } from '@/core/client';

export async function me() {
  return authedSafeRequest<{ userId: string; username: string }>('/api/auth/me');
}
