import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service.js';
import { CreateInviteDto } from './dto/admin.dto.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Validate admin master key from request header.
   */
  validateAdminKey(key: string | undefined): void {
    const masterKey = this.config.getOrThrow<string>('INVITE_MASTER_KEY');
    if (key !== masterKey) {
      throw new UnauthorizedException('Admin key không hợp lệ');
    }
  }

  /**
   * Create a new invite code.
   */
  async createInvite(dto: CreateInviteDto) {
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const invite = await this.prisma.inviteCode.create({
      data: {
        code: dto.code,
        maxUses: dto.maxUses ?? 1,
        expiresAt,
      },
    });

    return {
      message: `Mã mời "${invite.code}" đã được tạo thành công!`,
      invite: {
        id: invite.id,
        code: invite.code,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
      },
    };
  }

  /**
   * List all invite codes with usage info.
   */
  async listInvites() {
    const invites = await this.prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        usedBy: { select: { username: true } },
      },
    });

    return { invites };
  }

  /**
   * Deactivate an invite code by ID.
   */
  async deactivateInvite(id: string) {
    await this.prisma.inviteCode.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Mã mời đã bị vô hiệu hóa' };
  }
}
