import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const LOBBY_NAME = '💎 Đại Sảnh Chat Talent';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private lobbyId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  // ========== LOBBY (ĐẠI SẢNH) ==========

  /**
   * Lấy hoặc tạo Đại Sảnh duy nhất.
   * Gọi 1 lần khi server start, cache ID.
   */
  async getOrCreateLobby() {
    if (this.lobbyId) {
      return this.lobbyId;
    }

    let lobby = await this.prisma.chatGroup.findFirst({
      where: { groupName: LOBBY_NAME },
    });

    if (!lobby) {
      // Tạo lobby lần đầu — không có createdById (system)
      lobby = await this.prisma.chatGroup.create({
        data: { groupName: LOBBY_NAME },
      });
      this.logger.log(`🏛️ Đại Sảnh đã được tạo: ${lobby.id}`);
    }

    this.lobbyId = lobby.id;
    return this.lobbyId;
  }

  /**
   * Tự động thêm user vào Đại Sảnh khi đăng ký/đăng nhập.
   */
  async autoJoinLobby(userId: string) {
    const lobbyId = await this.getOrCreateLobby();

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: lobbyId, userId } },
    });

    if (!existing) {
      await this.prisma.groupMember.create({
        data: { groupId: lobbyId, userId, role: 'MEMBER' },
      });
      this.logger.log(`👤 User ${userId} đã vào Đại Sảnh`);
    }

    return lobbyId;
  }

  /**
   * Lấy thông tin Đại Sảnh + danh sách thành viên
   */
  async getLobbyInfo() {
    const lobbyId = await this.getOrCreateLobby();

    return this.prisma.chatGroup.findUnique({
      where: { id: lobbyId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  // ========== MEMBERSHIP ==========

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    return !!member;
  }

  // ========== MESSAGES ==========

  async saveMessage(data: {
    groupId: string;
    senderId: string;
    content: string;
    replyToId?: string;
  }) {
    return this.prisma.message.create({
      data: {
        groupId: data.groupId,
        senderId: data.senderId,
        content: data.content,
        replyToId: data.replyToId,
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { username: true } },
          },
        },
      },
    });
  }

  async getMessages(groupId: string, cursor?: string, limit = 50) {
    const messages = await this.prisma.message.findMany({
      where: { groupId },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { username: true } },
          },
        },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    };
  }

  async editMessage(messageId: string, senderId: string, content: string) {
    return this.prisma.message.updateMany({
      where: { id: messageId, senderId },
      data: { content, editedAt: new Date() },
    });
  }

  async deleteMessage(messageId: string, senderId: string) {
    return this.prisma.message.deleteMany({
      where: { id: messageId, senderId },
    });
  }
}
