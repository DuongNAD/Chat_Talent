import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const tokens = await this.authService.register(dto);
    return {
      message: 'Đăng ký thành công! Chào mừng bạn đến Chat Talent 🎉',
      ...tokens,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return {
      message: 'Đăng nhập thành công!',
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthTokens> {
    return this.authService.refreshTokens(refreshToken);
  }
}
