import { api } from '@shared/lib/api-client';

export const chatApi = {
  getLobby: () => api.get('/api/chat/lobby'),

  getMessages: (cursor?: string) =>
    api.get('/api/chat/lobby/messages', {
      params: { cursor, limit: 50 },
    }),

  getMe: () => api.get('/api/users/me'),
};
