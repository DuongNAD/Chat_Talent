import { useState } from 'react';
import { Search, Upload, Flame, MessageCircle, Sparkles, Heart, ThumbsUp } from 'lucide-react';
import '../moments.css';

const INITIAL_MOMENTS = [
  {
    id: 1,
    user: { name: 'Minh Hiếu', time: '2 giờ trước', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
    content: 'Góc setup mới hoàn thiện. Chạy mượt mà mọi tựa game! 🚀💻',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80',
    stats: [{ id: 'flame', icon: Flame, count: 24, active: true }, { id: 'msg', icon: MessageCircle, count: 5, active: false }],
    type: 'image'
  },
  {
    id: 2,
    user: { name: 'Liva', time: 'Vừa xong', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80' },
    content: 'Tạo ra ý tưởng không gian làm việc tương lai theo yêu cầu của @MinhHieu. Bạn nghĩ sao về thiết kế này?',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
    stats: [{ id: 'sparkles', icon: Sparkles, count: 156, active: true }],
    badge: '✨ AI GEN',
    type: 'ai-gen'
  },
  {
    id: 3,
    user: { name: 'Tuan Anh', time: 'Hôm qua', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80' },
    content: 'Demo script tự động hóa mới viết tối qua. Tốc độ bàn thờ! ⚡',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
    stats: [{ id: 'flame', icon: Flame, count: 42, active: true }],
    type: 'video'
  },
  {
    id: 4,
    user: { name: 'Hoang Yen', time: '2 ngày trước', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80' },
    content: 'Nâng cấp nhẹ phần cứng cho máy trạm. Render video giờ chỉ tính bằng giây.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80',
    stats: [{ id: 'thumb', icon: ThumbsUp, count: 12, active: true }, { id: 'msg', icon: MessageCircle, count: 3, active: false }],
    type: 'image'
  },
  {
    id: 5,
    user: { name: 'Linh Dan', time: '4 giờ trước', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80' },
    content: 'Vừa deploy xong dự án, cảm giác thật nhẹ nhõm. Cuối tuần này nghỉ ngơi thôi anh em ơi! ☕',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80',
    stats: [{ id: 'heart', icon: Heart, count: 89, active: true }, { id: 'thumb', icon: ThumbsUp, count: 0, active: false }],
    type: 'image'
  }
];

export function MomentsFeed() {
  const [moments, setMoments] = useState(INITIAL_MOMENTS);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleStat = (momentId: number, statId: string) => {
    setMoments(prev => prev.map(m => {
      if (m.id !== momentId) return m;
      return {
        ...m,
        stats: m.stats.map(s => {
          if (s.id !== statId) return s;
          const willBeActive = !s.active;
          return {
            ...s,
            active: willBeActive,
            count: willBeActive ? s.count + 1 : Math.max(0, s.count - 1)
          };
        })
      };
    }));
  };

  const handleUpload = () => {
    alert('Tính năng tải lên đang được xây dựng!');
  };

  const filteredMoments = moments.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="moments-page">
      <header className="moments-header">
        <div className="moments-title">
          <h1>Khoảnh khắc</h1>
          <p>Khám phá những khoảnh khắc mới nhất từ bạn bè.</p>
        </div>
        
        <div className="moments-actions">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="upload-btn" onClick={handleUpload}>
            <Upload size={18} />
            Tải lên
          </button>
        </div>
      </header>

      <div className="moments-grid">
        {filteredMoments.map(m => (
          <div key={m.id} className={`moment-card ${m.type === 'ai-gen' ? 'ai-gen-card' : ''}`}>
            <div className="moment-media">
              {m.badge && <div className="media-badge">{m.badge}</div>}
              <img src={m.image} alt="post media" />
              {m.type === 'video' && (
                <div className="play-btn-overlay">
                  <div className="play-icon">▶</div>
                </div>
              )}
            </div>
            
            <div className="moment-info">
              <div className="moment-user">
                <img src={m.user.avatar} alt={m.user.name} className="avatar" />
                <div className="user-details">
                  <strong>{m.user.name}</strong>
                  <span>{m.user.time}</span>
                </div>
              </div>
              <p className="moment-content">{m.content}</p>
              
              <div className="moment-stats">
                {m.stats.map((stat, i) => (
                  <button 
                    key={i} 
                    className={`stat-btn ${stat.active ? 'active' : ''}`}
                    onClick={() => handleToggleStat(m.id, stat.id)}
                  >
                    <stat.icon size={14} />
                    {stat.count > 0 ? stat.count : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredMoments.length === 0 && (
          <div style={{ padding: '40px', color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
            Không tìm thấy khoảnh khắc nào phù hợp với "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
