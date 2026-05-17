// ========== USER TYPES ==========

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  role: string;
}

// ========== LOBBY / GROUP TYPES ==========

export interface LobbyMember {
  user: User;
  role: string;
}

// ========== MESSAGE TYPES ==========

export interface Message {
  id: string;
  content: string;
  sender: { id: string; username: string; avatarUrl?: string };
  replyTo?: { id: string; content: string; sender: { username: string } };
  createdAt: string;
  editedAt?: string;
}

// ========== CALL TYPES ==========

export type CallStatus =
  | 'idle'
  | 'calling'     // Đang đổ chuông
  | 'ringing'     // Có cuộc gọi đến
  | 'connecting'  // Đang kết nối WebRTC
  | 'connected'   // Đang gọi
  | 'ended';
