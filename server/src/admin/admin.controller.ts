import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { CreateInviteDto } from './dto/admin.dto.js';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('invites')
  async createInvite(
    @Headers('x-admin-key') adminKey: string,
    @Body() dto: CreateInviteDto,
  ) {
    this.adminService.validateAdminKey(adminKey);
    return this.adminService.createInvite(dto);
  }

  @Get('invites')
  async listInvites(@Headers('x-admin-key') adminKey: string) {
    this.adminService.validateAdminKey(adminKey);
    return this.adminService.listInvites();
  }

  @Delete('invites/:id')
  async deactivateInvite(
    @Headers('x-admin-key') adminKey: string,
    @Param('id') id: string,
  ) {
    this.adminService.validateAdminKey(adminKey);
    return this.adminService.deactivateInvite(id);
  }
}
