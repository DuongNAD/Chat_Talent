import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(url: string, token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(url, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    // Cloudflare Tunnel: force WebSocket (skip polling fallback)
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('🔌 Socket error:', err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
