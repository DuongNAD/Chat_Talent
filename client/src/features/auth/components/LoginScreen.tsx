import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Terminal, Link, User, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import '@features/auth/auth.css';

export function LoginScreen() {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, bypassLogin } = useAuthStore();
  const glowRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, inviteCode);
      } else {
        await login(username, password);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 40; 
    const y = (clientY / window.innerHeight - 0.5) * 40;
    glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  return (
    <div className="login-screen-pro" onMouseMove={handleMouseMove}>
      <div className="login-glow" ref={glowRef}></div>
      
      <form className="login-card-pro" onSubmit={handleSubmit}>
        <div className="login-header-pro">
          <div className="title-row">
            <h1>Chat_Talent</h1>
            <span className="badge-pro">V2.0 PRO</span>
          </div>
        </div>

        {error && <div className="error-msg-pro">{error}</div>}

        <div className="form-fields-pro">
          {isRegister && (
            <div className="form-group-pro">
              <label><Link size={14} /> Mã mời</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="NHẬP MÃ MỜI 8 KÝ TỰ"
                required
              />
            </div>
          )}

          <div className="form-group-pro">
            <label><User size={14} /> Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập định danh"
              autoFocus
              required
            />
          </div>

          <div className="form-group-pro">
            <label><Lock size={14} /> Mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions-pro">
          <button type="submit" className="btn-primary-pro" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            {!loading && <ArrowRight size={18} />}
          </button>
          
          <button 
            type="button" 
            className="btn-text-link" 
            onClick={bypassLogin}
            style={{ marginTop: '-8px', opacity: 0.8 }}
          >
            Vào thẳng giao diện (Bypass)
          </button>

          <button type="button" className="btn-text-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Yêu cầu mã mời / Đăng ký'}
          </button>
        </div>

        <div className="login-footer-pro">
          <Lock size={12} />
          <span>Phiên kết nối được mã hóa đầu cuối</span>
        </div>
      </form>
    </div>
  );
}
