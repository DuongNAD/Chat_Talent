import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: 'Giải Đấu Cờ Vua Mùa Hè 2026',
    date: '20 Tháng 5, 2026',
    time: '19:00 - 22:00',
    location: 'Sảnh Trực Tuyến 1',
    participants: 128,
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=500&q=80',
    status: 'Sắp diễn ra'
  },
  {
    id: 2,
    title: 'Hội Thảo Tech Talk: Tương lai của AI',
    date: '25 Tháng 5, 2026',
    time: '14:00 - 16:00',
    location: 'Phòng Hội Nghị Ảo',
    participants: 450,
    image: 'https://images.unsplash.com/photo-1591453006520-1bc325170d1d?w=500&q=80',
    status: 'Đang mở đăng ký'
  },
  {
    id: 3,
    title: 'Marathon Lập Trình (Hackathon) 48h',
    date: '01 Tháng 6, 2026',
    time: '08:00',
    location: 'Chat_Talent Dev Server',
    participants: 85,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80',
    status: 'Đang mở đăng ký'
  }
];

export function EventsView() {
  const [events, setEvents] = useState(mockEvents);

  const handleRegister = (id: number) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, participants: e.participants + 1, status: 'Đã đăng ký' };
      }
      return e;
    }));
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Sự Kiện Sắp Tới</h1>
        <p style={{ color: 'var(--text-dim)' }}>Tham gia các sự kiện, giải đấu và buổi giao lưu cùng cộng đồng.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {events.map(event => (
          <div key={event.id} style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ height: '160px', width: '100%', position: 'relative' }}>
              <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', top: 12, right: 12, 
                background: event.status === 'Đã đăng ký' ? 'var(--success)' : 'var(--accent)', 
                color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 
              }}>
                {event.status}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>{event.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> {event.date}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {event.time}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {event.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> {event.participants} người tham gia</div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleRegister(event.id); }}
                disabled={event.status === 'Đã đăng ký'}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: event.status === 'Đã đăng ký' ? 'var(--bg-tertiary)' : 'rgba(108, 92, 231, 0.1)',
                  color: event.status === 'Đã đăng ký' ? 'var(--text-muted)' : 'var(--accent)',
                  fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: event.status === 'Đã đăng ký' ? 'default' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {event.status === 'Đã đăng ký' ? 'Đã Ghi Danh' : 'Đăng Ký Tham Gia'}
                {event.status !== 'Đã đăng ký' && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
