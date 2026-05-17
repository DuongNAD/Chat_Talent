import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';

export function LivaView() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'liva', text: 'Xin chào! Tôi là Liva, trợ lý AI của bạn trên Chat_Talent. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'liva', 
        text: `Đây là phản hồi tự động từ Liva AI cho nội dung: "${userMsg}". Tính năng AI tạo sinh thực sự đang được tích hợp, nhưng hiện tại tôi có thể trò chuyện giả lập cùng bạn!` 
      }]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      <header style={{ 
        height: 64, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0,
        background: 'rgba(108, 92, 231, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Liva AI</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--online)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--online)' }}></span> Trực tuyến
            </span>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} style={{ display: 'flex', gap: '12px', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {!isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <Bot size={16} />
                </div>
              )}
              
              <div style={{ 
                background: isUser ? 'var(--accent)' : 'var(--bg-secondary)', 
                color: isUser ? '#fff' : 'var(--text-main)',
                padding: '12px 16px', 
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                border: isUser ? 'none' : '1px solid var(--border)',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                {msg.text}
              </div>

              {isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}
        
        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Bot size={16} />
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'onlinePulse 1s infinite' }}></span>
              <span className="dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'onlinePulse 1s infinite 0.2s' }}></span>
              <span className="dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'onlinePulse 1s infinite 0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--app-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--input-bg)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi Liva bất cứ điều gì..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', padding: '8px 0' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            style={{ 
              background: input.trim() ? 'var(--accent)' : 'var(--bg-tertiary)', 
              color: input.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
            }}
          >
            <Send size={16} style={{ marginLeft: 2 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
