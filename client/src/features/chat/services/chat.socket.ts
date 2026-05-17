import { API_URL } from '@shared/lib/api-client';
import { connectSocket, disconnectSocket, getSocket } from '@shared/lib/socket-client';
import { useChatStore } from '../store/chatStore';
import type { Message } from '@shared/types';

const SOCKET_URL = `${API_URL}/chat`;

/**
 * Initialize chat socket connection and register all event listeners.
 * Called once when user logs in.
 */
export function setupChatSocket(token: string) {
  const socket = connectSocket(SOCKET_URL, token);
  const { setState } = useChatStore;

  socket.on('new_message', (message: Message) => {
    const state = useChatStore.getState();
    setState({ messages: [...state.messages, message] });
  });

  socket.on('message_edited', (data: { messageId: string; content: string; editedAt: string }) => {
    const state = useChatStore.getState();
    setState({
      messages: state.messages.map((m) =>
        m.id === data.messageId ? { ...m, content: data.content, editedAt: data.editedAt } : m,
      ),
    });
  });

  socket.on('message_deleted', (data: { messageId: string }) => {
    const state = useChatStore.getState();
    setState({ messages: state.messages.filter((m) => m.id !== data.messageId) });
  });

  socket.on('user_typing', (data: { userId: string; username: string }) => {
    const state = useChatStore.getState();
    const newMap = new Map(state.typingUsers);
    newMap.set(data.userId, data.username);
    setState({ typingUsers: newMap });
  });

  socket.on('user_stop_typing', (data: { userId: string }) => {
    const state = useChatStore.getState();
    const newMap = new Map(state.typingUsers);
    newMap.delete(data.userId);
    setState({ typingUsers: newMap });
  });

  socket.on('user:online', (data: { userId: string }) => {
    const state = useChatStore.getState();
    const newSet = new Set(state.onlineUsers);
    newSet.add(data.userId);
    setState({ onlineUsers: newSet });
  });

  socket.on('user:offline', (data: { userId: string }) => {
    const state = useChatStore.getState();
    const newSet = new Set(state.onlineUsers);
    newSet.delete(data.userId);
    setState({ onlineUsers: newSet });
  });

  socket.on('online_users', (userIds: string[]) => {
    setState({ onlineUsers: new Set(userIds) });
  });

  // Request online users list
  socket.emit('get_online_users');
}

export { disconnectSocket, getSocket };
