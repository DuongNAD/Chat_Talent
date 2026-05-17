import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CallGateway } from './call.gateway.js';
import { CallService } from './call.service.js';

@Module({
  imports: [JwtModule.register({})],
  providers: [CallGateway, CallService],
})
export class CallModule {}
