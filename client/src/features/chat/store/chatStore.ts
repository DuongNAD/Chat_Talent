import { create } from 'zustand';
import { chatApi } from '../services/chat.api';
import { getSocket } from '../services/chat.socket';
import type { LobbyMember, Message } from '@shared/types';

export interface ChatState {
  lobbyId: string | null;
  lobbyName: string;
  members: LobbyMember[];
  messages: Message[];
  typingUsers: Map<string, string>;
  onlineUsers: Set<string>;
  replyingTo: Message | null;

  loadLobby: () => Promise<void>;
  sendMessage: (content: string, replyToId?: string) => void;
  setReplyingTo: (msg: Message | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  lobbyId: null,
  lobbyName: '💎 Đại Sảnh Chat Talent',
  members: [],
  messages: [],
  typingUsers: new Map(),
  onlineUsers: new Set(),
  replyingTo: null,

  loadLobby: async () => {
    try {
      const { data } = await chatApi.getLobby();
      const lobby = data.lobby;
      set({
        lobbyId: lobby.id,
        lobbyName: lobby.groupName,
        members: lobby.members,
      });
      const msgRes = await chatApi.getMessages();
      set({ messages: msgRes.data.messages || [] });
    } catch (err) {
      console.error('Failed to load lobby, falling back to mock mode:', err);
      
      // MOCK DATA FOR BYPASS MODE
      const { useAuthStore } = await import('@features/auth/store/authStore');
      const currentUser = useAuthStore.getState().user || { 
        id: 'mock-user', username: 'Demo User', role: 'user', createdAt: '', updatedAt: '' 
      };
      
      set({
        lobbyId: 'mock-lobby-id',
        lobbyName: '💎 Đại Sảnh (Chế độ Bypass)',
        members: [
          { id: 'm1', userId: currentUser.id, groupId: 'mock-lobby-id', role: 'member', joinedAt: '', user: currentUser },
          { id: 'm2', userId: 'bot-1', groupId: 'mock-lobby-id', role: 'admin', joinedAt: '', user: { id: 'bot-1', username: 'System Bot', role: 'admin', createdAt: '', updatedAt: '' } }
        ],
        messages: [
          {
            id: 'msg-1',
            groupId: 'mock-lobby-id',
            senderId: 'bot-1',
            content: 'Chào mừng bạn đến với chế độ Bypass! API không kết nối nhưng bạn vẫn có thể test giao diện tại đây. 🚀',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: { id: 'bot-1', username: 'System Bot', role: 'admin', createdAt: '', updatedAt: '' }
          }
        ]
      });
    }
  },

  sendMessage: async (content, replyToId) => {
    const { lobbyId, messages } = get();
    const socket = getSocket();
    
    if (!socket || lobbyId === 'mock-lobby-id') {
      // MOCK SENDING MESSAGE
      const { useAuthStore } = await import('@features/auth/store/authStore');
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;
      
      const replyMsg = replyToId ? messages.find(m => m.id === replyToId) : undefined;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        groupId: lobbyId || 'mock-lobby-id',
        senderId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: currentUser,
        replyToId,
        replyTo: replyMsg
      };
      
      set({ messages: [...messages, newMessage], replyingTo: null });
      return;
    }
    
    socket.emit('send_message', { groupId: lobbyId, content, replyToId });
    set({ replyingTo: null });
  },

  setReplyingTo: (msg) => set({ replyingTo: msg }),

  reset: () =>
    set({
      lobbyId: null,
      members: [],
      messages: [],
      onlineUsers: new Set(),
      typingUsers: new Map(),
      replyingTo: null,
    }),
}));
