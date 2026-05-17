import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '@features/auth/store/authStore';
import { Users, Crown, Shield, LogOut } from 'lucide-react';
import { CallButtons } from '@features/call/components/CallButtons';
import type { LobbyMember } from '@shared/types';

export function MembersPanel() {
  const { members, onlineUsers } = useChatStore();
  const { user, logout } = useAuthStore();

  const sortedMembers = [...members].sort((a, b) => {
    const aOnline = onlineUsers.has(a.user.id);
    const bOnline = onlineUsers.has(b.user.id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return a.user.username.localeCompare(b.user.username);
  });

  const onlineCount = members.filter((m) => onlineUsers.has(m.user.id)).length;

  return (
    <div className="members-panel">
      <div className="members-header">
        <Users size={16} />
        <span>Thành viên</span>
        <span className="member-count">{onlineCount}/{members.length}</span>
      </div>
      <div className="members-list">
        {sortedMembers.map((member) => (
          <MemberItem
            key={member.user.id}
            member={member}
            isOnline={onlineUsers.has(member.user.id)}
            isMe={member.user.id === user?.id}
          />
        ))}
      </div>
      <div className="members-footer">
        <div className="current-user">
          <div className="member-avatar" style={{ background: 'linear-gradient(135deg, #6c5ce7, #e17055)' }}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="member-name">{user?.username}</div>
            <div className="member-role-badge">
              {user?.role === 'SYSTEM_ADMIN' ? '👑 Admin' : '👤 Member'}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Đăng xuất">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

function MemberItem({ member, isOnline, isMe }: {
  member: LobbyMember; isOnline: boolean; isMe: boolean;
}) {
  const roleIcon =
    member.role === 'OWNER' ? <Crown size={12} className="role-icon owner" /> :
    member.role === 'ADMIN' ? <Shield size={12} className="role-icon admin" /> : null;

  return (
    <div className={`member-item ${isOnline ? 'online' : 'offline'}`}>
      <div className="member-avatar-wrapper">
        <div className="member-avatar" style={{
          background: isOnline ? 'linear-gradient(135deg, #00b894, #00cec9)' : 'var(--bg-tertiary)',
        }}>{member.user.username.charAt(0).toUpperCase()}</div>
        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
      </div>
      <span className="member-name">
        {member.user.username}
        {isMe && <span className="me-badge">bạn</span>}
        {roleIcon}
      </span>
      {!isMe && <CallButtons peerId={member.user.id} peerUsername={member.user.username} />}
    </div>
  );
}
