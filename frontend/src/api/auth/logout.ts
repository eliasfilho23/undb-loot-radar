import { safeRequest } from '@/core/client';

export async function logout() {
  return safeRequest<Record<string, never>>('/api/auth/client-logout', {
    method: 'POST',
  });
}
