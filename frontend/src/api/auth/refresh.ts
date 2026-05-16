import { safeRequest } from '@/core/client';

export async function refresh() {
  return safeRequest<{ userId: string; username: string }>('/api/auth/refresh-cookie', {
    method: 'POST',
  });
}
