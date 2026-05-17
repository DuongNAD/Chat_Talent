import { useState, useEffect } from 'react';
import { User, Bell, Shield, Paintbrush, LogOut, Check } from 'lucide-react';
import { useAuthStore } from '@features/auth/store/authStore';

export function SettingsView() {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(document.body.classList.contains('light-theme') ? 'light' : 'dark');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Cài đặt & Quyền riêng tư</h1>
        <p style={{ color: 'var(--text-dim)' }}>Quản lý tùy chọn cá nhân và giao diện của bạn.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '32px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile */}
        <section style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <User size={20} className="text-accent" /> Hồ sơ cá nhân
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', margin: '0 0 4px 0' }}>{user?.username || 'Người dùng ẩn danh'}</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Quyền hạn: {user?.role || 'Khách'}</p>
              <button style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer' }}>Đổi ảnh đại diện</button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Paintbrush size={20} className="text-accent" /> Giao diện
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div 
              onClick={() => toggleTheme('dark')}
              style={{ padding: '16px', border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: '#0f0f14', color: '#fff', position: 'relative' }}
            >
              {theme === 'dark' && <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent)' }}><Check size={18} /></div>}
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Dark Mode</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Giao diện tối chuyên nghiệp (Pro)</div>
            </div>

            <div 
              onClick={() => toggleTheme('light')}
              style={{ padding: '16px', border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: '#f0f2f5', color: '#111827', position: 'relative' }}
            >
              {theme === 'light' && <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent)' }}><Check size={18} /></div>}
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Light Mode</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Giao diện sáng sủa, rõ ràng</div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Bell size={20} className="text-accent" /> Thông báo
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Nhận thông báo đẩy (Push)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khi có tin nhắn hoặc sự kiện mới</div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              style={{ width: 44, height: 24, borderRadius: 12, background: notifications ? 'var(--accent)' : 'var(--bg-tertiary)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: notifications ? 22 : 2, transition: 'left 0.2s' }} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Âm thanh ứng dụng</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phát tiếng "ting" khi có tin nhắn</div>
            </div>
            <button 
              onClick={() => setSounds(!sounds)}
              style={{ width: 44, height: 24, borderRadius: 12, background: sounds ? 'var(--accent)' : 'var(--bg-tertiary)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: sounds ? 22 : 2, transition: 'left 0.2s' }} />
            </button>
          </div>
        </section>

        {/* Security & Danger */}
        <section style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Shield size={20} className="text-accent" /> Bảo mật & Phiên kết nối
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Đăng xuất thiết bị này</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hủy toàn bộ token và phiên kết nối cục bộ</div>
            </div>
            <button 
              onClick={logout}
              style={{ padding: '8px 16px', background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
