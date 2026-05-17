import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'Chat_Talent là gì?', a: 'Chat_Talent là một nền tảng giao tiếp an toàn, bảo mật đầu cuối, tích hợp các công cụ hỗ trợ AI (Liva) cùng các tiện ích kết nối cộng đồng như giải trí và sự kiện.' },
  { q: 'Làm thế nào để thay đổi tên hiển thị?', a: 'Truy cập vào mục Cài đặt (Settings) trên thanh bên trái. Tại mục "Hồ sơ cá nhân", bạn có thể tùy chỉnh thông tin tài khoản của mình.' },
  { q: 'Bảo mật đầu cuối (E2E) hoạt động thế nào?', a: 'Tin nhắn của bạn được mã hóa bằng khóa riêng trên thiết bị của bạn trước khi gửi lên máy chủ. Chỉ người nhận hợp lệ mới có khóa để giải mã tin nhắn đó.' },
  { q: 'Tôi quên mật khẩu, làm sao để khôi phục?', a: 'Hiện tại hệ thống đang trong giai đoạn Alpha. Vui lòng liên hệ trực tiếp với quản trị viên (Admin) thông qua mục Liên hệ hỗ trợ bên dưới để được cấp lại mật khẩu.' }
];

export function SupportView() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticket, setTicket] = useState('');

  const handleSendTicket = () => {
    if (!ticket.trim()) return;
    alert('Yêu cầu hỗ trợ của bạn đã được gửi đến Admin. Chúng tôi sẽ phản hồi sớm nhất có thể!');
    setTicket('');
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Trung Tâm Hỗ Trợ</h1>
        <p style={{ color: 'var(--text-dim)' }}>Chúng tôi có thể giúp gì cho bạn? Tìm kiếm câu trả lời nhanh ở phần hỏi đáp bên dưới.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Contact Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chat với Admin</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hỗ trợ trực tuyến 24/7</p>
            <button style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer' }}>Bắt đầu chat</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Gửi Email Hỗ trợ</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phản hồi trong 2-4 giờ</p>
            <button style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer' }}>Soạn thư</button>
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HelpCircle size={20} className="text-accent" /> Câu hỏi thường gặp (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                  >
                    {faq.q}
                    {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px 20px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Send Ticket Form */}
        <section style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 16px 0' }}>Bạn vẫn cần trợ giúp?</h2>
          <textarea 
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
            style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical', outline: 'none', marginBottom: '16px' }}
          />
          <button 
            onClick={handleSendTicket}
            disabled={!ticket.trim()}
            style={{ padding: '12px 24px', background: ticket.trim() ? 'var(--accent)' : 'var(--bg-tertiary)', color: ticket.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: ticket.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
          >
            Gửi yêu cầu
          </button>
        </section>

      </div>
    </div>
  );
}
