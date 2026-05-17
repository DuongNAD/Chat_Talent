import { useRef, useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import {
  Mic, MicOff, VideoOff, PhoneOff, Camera, CameraOff,
} from 'lucide-react';

export function CallScreen() {
  const {
    status, peerUsername, callType, callDuration,
    isAudioEnabled, isVideoEnabled, isPeerVideoEnabled,
    localStream, remoteStream,
    endCall, toggleAudio, toggleVideo,
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isActive = status === 'calling' || status === 'connecting' || status === 'connected';
  if (!isActive) return null;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statusText = status === 'calling' ? 'Đang đổ chuông...'
    : status === 'connecting' ? 'Đang kết nối...'
    : formatDuration(callDuration);

  const isVideo = callType === 'video';

  return (
    <div className="call-overlay">
      <div className={`call-screen ${isVideo ? '' : 'audio-call'}`}>
        {/* Remote video (full screen) */}
        {isVideo && (
          <video
            ref={remoteVideoRef}
            autoPlay playsInline
            className={`remote-video ${!isPeerVideoEnabled ? 'hidden' : ''}`}
          />
        )}

        {/* Center content (audio mode or connecting) */}
        {(!isVideo || !isPeerVideoEnabled || status !== 'connected') && (
          <div className="call-center-content">
            <div className="call-avatar-large">
              {peerUsername?.charAt(0).toUpperCase()}
            </div>
            <div className="call-peer-name">{peerUsername}</div>
            <div className="call-status-text">{statusText}</div>
          </div>
        )}

        {/* Duration badge (video mode) */}
        {isVideo && status === 'connected' && (
          <div className="call-duration-overlay">
            <div className="call-duration-badge">{formatDuration(callDuration)}</div>
          </div>
        )}

        {/* Local video PiP */}
        {isVideo && (
          <div className={`local-video-pip ${!isVideoEnabled ? 'camera-off' : ''}`}>
            {isVideoEnabled ? (
              <video ref={localVideoRef} autoPlay playsInline muted />
            ) : (
              <div className="pip-camera-off"><CameraOff size={24} /></div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="call-controls">
          <button
            className={`call-control-btn ${!isAudioEnabled ? 'active' : ''}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Tắt mic' : 'Bật mic'}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {isVideo && (
            <button
              className={`call-control-btn ${!isVideoEnabled ? 'active' : ''}`}
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
            >
              {isVideoEnabled ? <Camera size={20} /> : <VideoOff size={20} />}
            </button>
          )}

          <button className="call-control-btn end-call" onClick={endCall} title="Kết thúc cuộc gọi">
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
