import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedSocket } from '../common/interfaces/authenticated-socket.interface.js';
import { authenticateSocket } from '../common/guards/ws-jwt-auth.guard.js';
import { ChatService } from './chat.service.js';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Track online users: userId → Set<socketId>
  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ========== CONNECTION LIFECYCLE ==========

  async handleConnection(client: AuthenticatedSocket) {
    if (!authenticateSocket(client, this.jwt, this.config, this.logger)) {
      return;
    }

    const { userId, username } = client.data;

    // Track online
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(client.id);

    // Auto-join Đại Sảnh
    const lobbyId = await this.chatService.autoJoinLobby(userId);
    await client.join(`group:${lobbyId}`);

    // Broadcast online status
    this.server.emit('user:online', {
      userId,
      username,
    });

    this.logger.log(`✅ ${username} connected (${client.id})`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.userId;
    const username = client.data?.username;

    if (userId) {
      const sockets = this.onlineUsers.get(userId);
      sockets?.delete(client.id);

      // Only broadcast offline if ALL sockets disconnected
      if (!sockets || sockets.size === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user:offline', { userId, username });
      }
    }

    this.logger.log(`❌ ${username || client.id} disconnected`);
  }

  // ========== MESSAGING ==========

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string; content: string; replyToId?: string },
  ) {
    const { userId } = client.data;

    // Permission check
    const isMember = await this.chatService.isMember(data.groupId, userId);
    if (!isMember) {
      client.emit('error', { message: 'Bạn không phải thành viên' });
      return;
    }

    // Save to DB
    const message = await this.chatService.saveMessage({
      groupId: data.groupId,
      senderId: userId,
      content: data.content,
      replyToId: data.replyToId,
    });

    // Broadcast to lobby room
    this.server.to(`group:${data.groupId}`).emit('new_message', message);
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string; groupId: string },
  ) {
    await this.chatService.editMessage(
      data.messageId,
      client.data.userId,
      data.content,
    );

    this.server.to(`group:${data.groupId}`).emit('message_edited', {
      messageId: data.messageId,
      content: data.content,
      editedAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; groupId: string },
  ) {
    await this.chatService.deleteMessage(data.messageId, client.data.userId);

    this.server.to(`group:${data.groupId}`).emit('message_deleted', {
      messageId: data.messageId,
    });
  }

  // ========== TYPING INDICATORS ==========

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string },
  ) {
    client.to(`group:${data.groupId}`).emit('user_typing', {
      userId: client.data.userId,
      username: client.data.username,
      groupId: data.groupId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string },
  ) {
    client.to(`group:${data.groupId}`).emit('user_stop_typing', {
      userId: client.data.userId,
      groupId: data.groupId,
    });
  }

  // ========== ONLINE STATUS ==========

  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const users = Array.from(this.onlineUsers.keys());
    client.emit('online_users', users);
  }
}
