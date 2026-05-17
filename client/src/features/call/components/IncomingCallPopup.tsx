import { useCallStore } from '../store/callStore';
import { PhoneOff, PhoneIncoming } from 'lucide-react';

export function IncomingCallPopup() {
  const { status, peerUsername, callType, acceptCall, rejectCall } = useCallStore();

  if (status !== 'ringing') return null;

  return (
    <div className="call-overlay">
      <div className="incoming-call-card">
        <div className="call-pulse-ring" />
        <div className="call-avatar-large call-avatar-animated">
          {peerUsername?.charAt(0).toUpperCase()}
        </div>
        <h2>{peerUsername}</h2>
        <p className="call-subtitle">
          {callType === 'video' ? '📹 Cuộc gọi video đến...' : '📞 Cuộc gọi thoại đến...'}
        </p>
        <div className="call-actions">
          <button className="call-btn" onClick={rejectCall}>
            <div className="call-btn-reject"><PhoneOff size={22} /></div>
            <span>Từ chối</span>
          </button>
          <button className="call-btn" onClick={acceptCall}>
            <div className="call-btn-accept"><PhoneIncoming size={22} /></div>
            <span>Chấp nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
}
