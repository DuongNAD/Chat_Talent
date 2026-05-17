import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // 1. Validate invite code
    const invite = await this.prisma.inviteCode.findUnique({
      where: { code: dto.inviteCode },
    });

    if (!invite || !invite.isActive) {
      throw new ForbiddenException('Mã mời không hợp lệ hoặc đã bị vô hiệu hóa');
    }

    if (invite.currentUses >= invite.maxUses) {
      throw new ForbiddenException('Mã mời đã được sử dụng hết');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ForbiddenException('Mã mời đã hết hạn');
    }

    // 2. Check username exists
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new BadRequestException('Tên người dùng đã tồn tại');
    }

    // 3. Create user + update invite code in transaction
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: dto.username,
          passwordHash,
        },
      });

      await tx.inviteCode.update({
        where: { id: invite.id },
        data: {
          currentUses: { increment: 1 },
          usedById: newUser.id,
          isActive: invite.maxUses <= invite.currentUses + 1 ? false : true,
        },
      });

      return newUser;
    });

    // 4. Generate tokens
    return this.generateTokens(user.id, user.username, user.role);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Update last seen
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    return this.generateTokens(user.id, user.username, user.role);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }) as { sub: string; username: string; role: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      return this.generateTokens(user.id, user.username, user.role);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  private generateTokens(
    userId: string,
    username: string,
    role: string,
  ): AuthTokens {
    const payload = { sub: userId, username, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: 900, // 15 minutes in seconds
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: 604800, // 7 days in seconds
    });

    return { accessToken, refreshToken };
  }
}
