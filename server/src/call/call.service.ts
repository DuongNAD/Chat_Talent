import { Injectable, Logger } from '@nestjs/common';

export interface ActiveCall {
  callId: string;
  callerId: string;
  callerUsername: string;
  calleeId: string;
  calleeUsername: string;
  type: 'audio' | 'video';
  startedAt: Date;
}

/**
 * CallService manages active call state and user-socket mappings.
 * Extracted from CallGateway to separate business logic from WebSocket handling.
 */
@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);

  // userId → socketId
  private userSockets = new Map<string, string>();
  // callId → ActiveCall
  private activeCalls = new Map<string, ActiveCall>();

  // ========== USER-SOCKET MAPPING ==========

  registerSocket(userId: string, socketId: string): void {
    this.userSockets.set(userId, socketId);
  }

  unregisterSocket(userId: string): void {
    this.userSockets.delete(userId);
  }

  getSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  // ========== ACTIVE CALLS ==========

  generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  isUserInCall(userId: string): boolean {
    for (const call of this.activeCalls.values()) {
      if (call.calleeId === userId || call.callerId === userId) {
        return true;
      }
    }
    return false;
  }

  createCall(call: ActiveCall): void {
    this.activeCalls.set(call.callId, call);
    this.logger.log(
      `📞 ${call.callerUsername} calling ${call.calleeUsername} (${call.type})`,
    );
  }

  getCall(callId: string): ActiveCall | undefined {
    return this.activeCalls.get(callId);
  }

  removeCall(callId: string): void {
    this.activeCalls.delete(callId);
  }

  /**
   * Get the other participant's userId in a call.
   */
  getOtherUserId(callId: string, currentUserId: string): string | null {
    const call = this.activeCalls.get(callId);
    if (!call) return null;
    return call.callerId === currentUserId ? call.calleeId : call.callerId;
  }

  /**
   * Get the target userId for signaling (SDP/ICE) in a call.
   */
  getSignalingTarget(callId: string, senderId: string): string | null {
    const call = this.activeCalls.get(callId);
    if (!call) return null;
    return call.callerId === senderId ? call.calleeId : call.callerId;
  }

  /**
   * End all active calls for a disconnecting user.
   * Returns list of {callId, otherUserId} for the gateway to notify.
   */
  endCallsForUser(userId: string): Array<{ callId: string; otherUserId: string }> {
    const endedCalls: Array<{ callId: string; otherUserId: string }> = [];

    for (const [callId, call] of this.activeCalls) {
      if (call.callerId === userId || call.calleeId === userId) {
        const otherUserId =
          call.callerId === userId ? call.calleeId : call.callerId;
        endedCalls.push({ callId, otherUserId });
        this.activeCalls.delete(callId);
      }
    }

    return endedCalls;
  }
}
