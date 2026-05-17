import { api } from '@shared/lib/api-client';

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),

  register: (username: string, password: string, inviteCode: string) =>
    api.post('/api/auth/register', { username, password, inviteCode }),

  refresh: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refreshToken }),
};
