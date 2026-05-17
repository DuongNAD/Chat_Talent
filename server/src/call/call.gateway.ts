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
import { CallService } from './call.service.js';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/call',
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CallGateway.name);

  constructor(
    private readonly callService: CallService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ========== CONNECTION ==========

  async handleConnection(client: AuthenticatedSocket) {
    if (!authenticateSocket(client, this.jwt, this.config, this.logger)) {
      return;
    }

    this.callService.registerSocket(client.data.userId, client.id);
    this.logger.log(`📞 ${client.data.username} connected to call namespace`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.userId;
    if (!userId) return;

    // End any active calls for this user
    const endedCalls = this.callService.endCallsForUser(userId);
    for (const { callId, otherUserId } of endedCalls) {
      const otherSocketId = this.callService.getSocketId(otherUserId);
      if (otherSocketId) {
        this.server.to(otherSocketId).emit('call:ended', {
          callId,
          reason: 'peer_disconnected',
        });
      }
    }

    this.callService.unregisterSocket(userId);
  }

  // ========== CALL INITIATION ==========

  @SubscribeMessage('call:initiate')
  handleInitiateCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { calleeId: string; calleeUsername: string; type: 'audio' | 'video' },
  ) {
    const callId = this.callService.generateCallId();
    const calleeSocketId = this.callService.getSocketId(data.calleeId);

    if (!calleeSocketId) {
      client.emit('call:error', {
        message: 'Người dùng không online',
        callId,
      });
      return;
    }

    // Check if callee is already in a call
    if (this.callService.isUserInCall(data.calleeId)) {
      client.emit('call:error', {
        message: 'Người dùng đang trong cuộc gọi khác',
        callId,
      });
      return;
    }

    this.callService.createCall({
      callId,
      callerId: client.data.userId,
      callerUsername: client.data.username,
      calleeId: data.calleeId,
      calleeUsername: data.calleeUsername,
      type: data.type,
      startedAt: new Date(),
    });

    // Notify callee
    this.server.to(calleeSocketId).emit('call:incoming', {
      callId,
      callerId: client.data.userId,
      callerUsername: client.data.username,
      type: data.type,
    });

    // Confirm to caller
    client.emit('call:ringing', { callId });
  }

  // ========== CALL RESPONSE ==========

  @SubscribeMessage('call:accept')
  handleAcceptCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string },
  ) {
    const call = this.callService.getCall(data.callId);
    if (!call) return;

    const callerSocketId = this.callService.getSocketId(call.callerId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('call:accepted', {
        callId: data.callId,
      });
    }

    this.logger.log(`✅ ${client.data.username} accepted call ${data.callId}`);
  }

  @SubscribeMessage('call:reject')
  handleRejectCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string },
  ) {
    const call = this.callService.getCall(data.callId);
    if (!call) return;

    const callerSocketId = this.callService.getSocketId(call.callerId);
    if (callerSocketId) {
      this.server.to(callerSocketId).emit('call:rejected', {
        callId: data.callId,
      });
    }

    this.callService.removeCall(data.callId);
    this.logger.log(`❌ ${client.data.username} rejected call ${data.callId}`);
  }

  @SubscribeMessage('call:end')
  handleEndCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string },
  ) {
    const otherUserId = this.callService.getOtherUserId(data.callId, client.data.userId);
    if (!otherUserId) return;

    const otherSocketId = this.callService.getSocketId(otherUserId);
    if (otherSocketId) {
      this.server.to(otherSocketId).emit('call:ended', {
        callId: data.callId,
        reason: 'ended_by_peer',
      });
    }

    this.callService.removeCall(data.callId);
    this.logger.log(`📵 Call ${data.callId} ended by ${client.data.username}`);
  }

  // ========== WebRTC SIGNALING ==========

  @SubscribeMessage('call:sdp-offer')
  handleSdpOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string; sdp: RTCSessionDescriptionInit },
  ) {
    const targetId = this.callService.getSignalingTarget(data.callId, client.data.userId);
    if (!targetId) return;

    const targetSocketId = this.callService.getSocketId(targetId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('call:sdp-offer', {
        callId: data.callId,
        sdp: data.sdp,
      });
    }
  }

  @SubscribeMessage('call:sdp-answer')
  handleSdpAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string; sdp: RTCSessionDescriptionInit },
  ) {
    const targetId = this.callService.getSignalingTarget(data.callId, client.data.userId);
    if (!targetId) return;

    const targetSocketId = this.callService.getSocketId(targetId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('call:sdp-answer', {
        callId: data.callId,
        sdp: data.sdp,
      });
    }
  }

  @SubscribeMessage('call:ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string; candidate: RTCIceCandidateInit },
  ) {
    const targetId = this.callService.getSignalingTarget(data.callId, client.data.userId);
    if (!targetId) return;

    const targetSocketId = this.callService.getSocketId(targetId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('call:ice-candidate', {
        callId: data.callId,
        candidate: data.candidate,
      });
    }
  }

  // ========== MEDIA TOGGLE ==========

  @SubscribeMessage('call:toggle-media')
  handleToggleMedia(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { callId: string; kind: 'audio' | 'video'; enabled: boolean },
  ) {
    const targetId = this.callService.getSignalingTarget(data.callId, client.data.userId);
    if (!targetId) return;

    const targetSocketId = this.callService.getSocketId(targetId);
    if (targetSocketId) {
      this.server.to(targetSocketId).emit('call:peer-toggle-media', {
        callId: data.callId,
        kind: data.kind,
        enabled: data.enabled,
      });
    }
  }
}
