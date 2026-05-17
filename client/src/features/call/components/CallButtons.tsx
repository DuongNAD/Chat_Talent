import { useCallStore } from '../store/callStore';
import { Phone, Video } from 'lucide-react';

/**
 * Call buttons shown in MembersPanel next to each member.
 */
export function CallButtons({ peerId, peerUsername }: { peerId: string; peerUsername: string }) {
  const { startCall, status } = useCallStore();
  const isInCall = status !== 'idle';

  return (
    <div className="call-header-buttons">
      <button
        className="call-header-btn"
        title="Gọi thoại"
        disabled={isInCall}
        onClick={() => startCall(peerId, peerUsername, 'audio')}
      >
        <Phone size={14} />
      </button>
      <button
        className="call-header-btn"
        title="Gọi video"
        disabled={isInCall}
        onClick={() => startCall(peerId, peerUsername, 'video')}
      >
        <Video size={14} />
      </button>
    </div>
  );
}
