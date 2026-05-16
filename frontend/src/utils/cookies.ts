export const Cookies = {
  getAccessToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  },

  deleteAccessToken() {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  },
};
