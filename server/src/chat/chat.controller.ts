import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Lấy thông tin Đại Sảnh + tự động join nếu chưa
   */
  @Get('lobby')
  async getLobby(@CurrentUser() user: CurrentUserPayload) {
    await this.chatService.autoJoinLobby(user.id);
    const lobby = await this.chatService.getLobbyInfo();
    return { lobby };
  }

  /**
   * Lấy tin nhắn từ Đại Sảnh
   */
  @Get('lobby/messages')
  async getLobbyMessages(
    @CurrentUser() user: CurrentUserPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const lobbyId = await this.chatService.autoJoinLobby(user.id);
    return this.chatService.getMessages(
      lobbyId,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
