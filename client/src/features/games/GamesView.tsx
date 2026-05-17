import { useState } from 'react';
import { Gamepad2, Trophy, Star, Play } from 'lucide-react';

const mockGames = [
  { id: 1, name: 'Cờ Ca-rô (Gomoku)', category: 'Trí tuệ', players: '2,450', rating: 4.8, image: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=500&q=80', color: '#ff6b6b' },
  { id: 2, name: 'Cờ Vua', category: 'Trí tuệ', players: '5,120', rating: 4.9, image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=500&q=80', color: '#4facfe' },
  { id: 3, name: 'Typing Speed', category: 'Phản xạ', players: '1,200', rating: 4.5, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80', color: '#43e97b' },
  { id: 4, name: 'Vẽ Đoán Chữ', category: 'Giải trí', players: '8,300', rating: 4.7, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80', color: '#fa709a' },
];

export function GamesView() {
  const [playing, setPlaying] = useState<number | null>(null);

  if (playing !== null) {
    const game = mockGames.find(g => g.id === playing);
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Gamepad2 className="text-accent" />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Đang chơi: {game?.name}</h2>
          </div>
          <button 
            onClick={() => setPlaying(null)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            Thoát game
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>🎮</h1>
            <h2>Đang tải tài nguyên trò chơi...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Kho Trò Chơi</h1>
        <p style={{ color: 'var(--text-dim)' }}>Giải trí và so tài cùng bạn bè trong thời gian rảnh rỗi.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {mockGames.map(game => (
          <div key={game.id} style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
              <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)` }}></div>
            </div>
            
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>{game.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: game.color, background: `${game.color}20`, padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{game.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f1c40f', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Star size={14} fill="#f1c40f" /> {game.rating}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                <Trophy size={14} /> {game.players} người đang chơi
              </div>

              <button 
                onClick={() => setPlaying(game.id)}
                style={{
                  marginTop: 'auto', width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'var(--accent)', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                <Play size={16} fill="currentColor" /> Chơi Ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
