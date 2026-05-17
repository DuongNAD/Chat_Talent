import { create } from 'zustand';
import { authApi } from '../services/auth.api';
import type { User } from '@shared/types';

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, inviteCode: string) => Promise<void>;
  restoreSession: () => void;
  logout: () => void;
  setUser: (user: User) => void;
  bypassLogin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,

  login: async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ isLoggedIn: true, user: data.user });
  },

  register: async (username, password, inviteCode) => {
    const { data } = await authApi.register(username, password, inviteCode);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ isLoggedIn: true, user: data.user });
  },

  restoreSession: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      set({
        isLoggedIn: true,
        user: { id: payload.sub, username: payload.username, role: payload.role },
      });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isLoggedIn: false, user: null });
  },

  setUser: (user) => set({ user }),

  bypassLogin: () => {
    set({
      isLoggedIn: true,
      user: { id: 'demo-id-123', username: 'Demo User', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });
  },
}));
