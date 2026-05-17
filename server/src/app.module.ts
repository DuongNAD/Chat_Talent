import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { UsersModule } from './users/users.module.js';
import { ChatModule } from './chat/chat.module.js';
import { CallModule } from './call/call.module.js';
import { HealthModule } from './health/health.module.js';
import { UpdaterModule } from './updater/updater.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    UsersModule,
    ChatModule,
    CallModule,
    HealthModule,
    UpdaterModule,
  ],
})
export class AppModule {}
