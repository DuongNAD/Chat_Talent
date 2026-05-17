import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '@features/auth/store/authStore';
import { getSocket } from '../services/chat.socket';
import { Send, Reply, X, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Message } from '@shared/types';

export function ChatArea() {
  const {
    lobbyId, lobbyName, members, messages,
    typingUsers, onlineUsers, replyingTo, setReplyingTo, sendMessage,
  } = useChatStore();
  const user = useAuthStore((s) => s.user);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [lobbyId]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim(), replyingTo?.id);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, replyingTo, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    const socket = getSocket();
    if (socket && lobbyId) {
      socket.emit('typing_start', { groupId: lobbyId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { groupId: lobbyId });
      }, 2000);
    }
  };

  const typingText = Array.from(typingUsers.values())
    .filter((name) => name !== user?.username).join(', ');
  const onlineCount = members.filter((m) => onlineUsers.has(m.user.id)).length;

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="lobby-header-icon"><Sparkles size={20} /></div>
        <div className="chat-header-info">
          <h2>{lobbyName}</h2>
          <p>
            {onlineCount} đang online • {members.length} thành viên
            {typingText && (
              <span style={{ color: 'var(--typing)', marginLeft: 8 }}>
                • {typingText} đang nhập...
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-lobby">
            <div className="welcome-lobby-icon">💎</div>
            <h3>Chào mừng đến Đại Sảnh!</h3>
            <p>Tất cả mọi người đều ở đây. Hãy bắt đầu trò chuyện! 🎉</p>
          </div>
        )}
        {messages.map((msg: Message, i: number) => {
          const prevMsg = messages[i - 1];
          const showAvatar = !prevMsg || prevMsg.sender.id !== msg.sender.id;
          const isMe = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className="message-group" style={{ paddingTop: showAvatar ? 12 : 0 }}>
              {showAvatar ? (
                <div className="message-avatar" style={{
                  background: isMe
                    ? 'linear-gradient(135deg, #6c5ce7, #e17055)'
                    : 'linear-gradient(135deg, #00b894, #00cec9)',
                }}>{msg.sender.username.charAt(0).toUpperCase()}</div>
              ) : (<div style={{ width: 36, flexShrink: 0 }} />)}
              <div className="message-content">
                {showAvatar && (
                  <div className="message-header">
                    <span className="author">{msg.sender.username}</span>
                    {isMe && <span className="me-tag">bạn</span>}
                    <span className="time">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                )}
                {msg.replyTo && (
                  <div className="reply-preview">
                    ↩ {msg.replyTo.sender.username}: {msg.replyTo.content?.slice(0, 80)}
                  </div>
                )}
                <div
                  className={`message-text ${msg.editedAt ? 'edited' : ''}`}
                  onDoubleClick={() => setReplyingTo(msg)}
                  title="Double-click để trả lời"
                >{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="typing-indicator">
        {typingText && (<><div className="typing-dots"><span /><span /><span /></div>{typingText} đang nhập...</>)}
      </div>

      <div className="input-area">
        {replyingTo && (
          <div className="reply-bar">
            <span>
              <Reply size={14} style={{ marginRight: 6 }} />
              Trả lời <strong>{replyingTo.sender.username}</strong>: {replyingTo.content?.slice(0, 60)}
            </span>
            <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
          </div>
        )}
        <div className="input-wrapper">
          <textarea
            ref={textareaRef} value={input} onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Enter gửi, Shift+Enter xuống dòng)" rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
