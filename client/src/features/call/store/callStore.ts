import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@shared/lib/api-client';
import type { CallStatus } from '@shared/types';

export interface CallState {
  status: CallStatus;
  callId: string | null;
  callType: 'audio' | 'video';
  peerId: string | null;
  peerUsername: string | null;
  isCaller: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isPeerAudioEnabled: boolean;
  isPeerVideoEnabled: boolean;
  callDuration: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  callSocket: Socket | null;

  initCallSocket: (token: string) => void;
  startCall: (calleeId: string, calleeUsername: string, type: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  cleanup: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

let durationInterval: ReturnType<typeof setInterval> | null = null;

export const useCallStore = create<CallState>((set, get) => ({
  status: 'idle',
  callId: null,
  callType: 'audio',
  peerId: null,
  peerUsername: null,
  isCaller: false,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isPeerAudioEnabled: true,
  isPeerVideoEnabled: true,
  callDuration: 0,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  callSocket: null,

  initCallSocket: (token: string) => {
    const existing = get().callSocket;
    if (existing?.connected) return;

    const socket = io(`${API_URL}/call`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('call:incoming', (data: { callId: string; callerId: string; callerUsername: string; type: 'audio' | 'video' }) => {
      set({ status: 'ringing', callId: data.callId, callType: data.type, peerId: data.callerId, peerUsername: data.callerUsername, isCaller: false });
    });

    socket.on('call:accepted', async () => {
      set({ status: 'connecting' });
      await createOfferAndSend();
    });

    socket.on('call:rejected', () => { get().cleanup(); });
    socket.on('call:ended', () => { get().cleanup(); });
    socket.on('call:error', (data: { message: string }) => { console.error('📞 Call error:', data.message); get().cleanup(); });
    socket.on('call:ringing', (data: { callId: string }) => { set({ callId: data.callId, status: 'calling' }); });

    socket.on('call:sdp-offer', async (data: { callId: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = get().peerConnection || createPeerConnection();
      set({ peerConnection: pc });
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:sdp-answer', { callId: data.callId, sdp: answer });
    });

    socket.on('call:sdp-answer', async (data: { sdp: RTCSessionDescriptionInit }) => {
      const pc = get().peerConnection;
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    socket.on('call:ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      const pc = get().peerConnection;
      if (pc && data.candidate) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on('call:peer-toggle-media', (data: { kind: 'audio' | 'video'; enabled: boolean }) => {
      if (data.kind === 'audio') set({ isPeerAudioEnabled: data.enabled });
      else set({ isPeerVideoEnabled: data.enabled });
    });

    set({ callSocket: socket });
  },

  startCall: async (calleeId, calleeUsername, type) => {
    const { callSocket } = get();
    if (!callSocket) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    set({ status: 'calling', callType: type, peerId: calleeId, peerUsername: calleeUsername, isCaller: true, localStream: stream, peerConnection: pc, isAudioEnabled: true, isVideoEnabled: type === 'video' });
    callSocket.emit('call:initiate', { calleeId, calleeUsername, type });
  },

  acceptCall: async () => {
    const { callSocket, callId, callType } = get();
    if (!callSocket || !callId) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    set({ status: 'connecting', localStream: stream, peerConnection: pc, isAudioEnabled: true, isVideoEnabled: callType === 'video' });
    callSocket.emit('call:accept', { callId });
  },

  rejectCall: () => {
    const { callSocket, callId } = get();
    if (callSocket && callId) callSocket.emit('call:reject', { callId });
    get().cleanup();
  },

  endCall: () => {
    const { callSocket, callId } = get();
    if (callSocket && callId) callSocket.emit('call:end', { callId });
    get().cleanup();
  },

  toggleAudio: () => {
    const { localStream, callSocket, callId, isAudioEnabled } = get();
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !isAudioEnabled;
      set({ isAudioEnabled: !isAudioEnabled });
      callSocket?.emit('call:toggle-media', { callId, kind: 'audio', enabled: !isAudioEnabled });
    }
  },

  toggleVideo: () => {
    const { localStream, callSocket, callId, isVideoEnabled } = get();
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !isVideoEnabled;
      set({ isVideoEnabled: !isVideoEnabled });
      callSocket?.emit('call:toggle-media', { callId, kind: 'video', enabled: !isVideoEnabled });
    }
  },

  cleanup: () => {
    const { localStream, peerConnection } = get();
    localStream?.getTracks().forEach((t) => t.stop());
    peerConnection?.close();
    if (durationInterval) { clearInterval(durationInterval); durationInterval = null; }
    set({ status: 'idle', callId: null, peerId: null, peerUsername: null, isCaller: false, localStream: null, remoteStream: null, peerConnection: null, isAudioEnabled: true, isVideoEnabled: true, isPeerAudioEnabled: true, isPeerVideoEnabled: true, callDuration: 0 });
  },
}));

function createPeerConnection(): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const store = useCallStore;
  const remoteStream = new MediaStream();
  store.setState({ remoteStream });

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    store.setState({ remoteStream });
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      const { callSocket, callId } = store.getState();
      callSocket?.emit('call:ice-candidate', { callId, candidate: event.candidate.toJSON() });
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') {
      store.setState({ status: 'connected' });
      durationInterval = setInterval(() => {
        store.setState((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);
    }
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      store.getState().endCall();
    }
  };

  return pc;
}

async function createOfferAndSend() {
  const { peerConnection, callSocket, callId, localStream } = useCallStore.getState();
  if (!peerConnection || !callSocket || !callId) return;
  if (localStream) {
    const senders = peerConnection.getSenders();
    if (senders.length === 0) {
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    }
  }
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  callSocket.emit('call:sdp-offer', { callId, sdp: offer });
}
