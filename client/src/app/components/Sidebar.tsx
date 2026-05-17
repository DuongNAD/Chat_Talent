import { MessageSquare, Layers, Calendar, Gamepad2, Sparkles, Settings, HelpCircle, Edit } from 'lucide-react';
import './sidebar.css';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'moments', label: 'Moments', icon: Layers },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'liva', label: 'Liva', icon: Sparkles, highlight: true },
  ];

  return (
    <aside className="sidebar-pro">
      <div className="sidebar-header">
        <div className="app-logo-area">
          <div className="app-logo-icon">
            <div className="logo-inner"></div>
          </div>
          <div className="app-logo-text">
            <h2>Chat_Talent</h2>
            <span className="status-online"><span className="dot"></span> Online</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            onClick={() => onChangeView(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => onChangeView('settings')}
        >
          <Settings size={20} />
          Settings
        </button>
        <button 
          className={`nav-item ${currentView === 'support' ? 'active' : ''}`}
          onClick={() => onChangeView('support')}
        >
          <HelpCircle size={20} />
          Support
        </button>
      </div>
    </aside>
  );
}
