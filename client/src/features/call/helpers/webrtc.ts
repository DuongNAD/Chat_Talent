/**
 * WebRTC helper functions — extracted from callStore for cleaner separation.
 */

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function createPeerConnection(
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  pc.ontrack = (event) => {
    if (event.streams[0]) onTrack(event.streams[0]);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate);
  };

  if (onConnectionStateChange) {
    pc.onconnectionstatechange = () => onConnectionStateChange(pc.connectionState);
  }

  return pc;
}

export async function getUserMedia(video: boolean): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
  });
}
