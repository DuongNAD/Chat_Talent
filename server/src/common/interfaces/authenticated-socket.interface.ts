import { Socket } from 'socket.io';

/**
 * Shared interface for WebSocket connections with JWT-authenticated user data.
 * Used by both ChatGateway and CallGateway to avoid duplicating the interface.
 */
export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    username: string;
    role: string;
  };
}
