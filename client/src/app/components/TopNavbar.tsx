import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Bell, X, Minus, Square } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './topnavbar.css';

export function TopNavbar() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleMinimize = async () => {
    try { await getCurrentWindow().minimize(); } catch (e) { console.log('Not in Tauri'); }
  };

  const handleMaximize = async () => {
    try { await getCurrentWindow().toggleMaximize(); } catch (e) { console.log('Not in Tauri'); }
  };

  const handleClose = async () => {
    try { await getCurrentWindow().close(); } catch (e) { console.log('Not in Tauri'); }
  };

  const handleNotification = () => {
    alert('Không có thông báo mới nào!');
  };

  return (
    <div className="top-navbar-pro" data-tauri-drag-region>
      <div className="navbar-left" data-tauri-drag-region>
        <Monitor size={16} className="app-icon" />
        <span className="app-name">Chat_Talent Desktop</span>
      </div>
      
      <div className="navbar-center" data-tauri-drag-region>
        <span className="nav-widget">Alpha V2.0</span>
      </div>

      <div className="navbar-right">
        <button className="nav-icon-btn" onClick={handleNotification} title="Thông báo">
          <Bell size={16} />
        </button>
        <button className="nav-icon-btn" onClick={toggleTheme} title="Đổi giao diện">
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        
        <div className="window-controls">
          <button className="win-btn" onClick={handleMinimize} title="Thu nhỏ"><Minus size={16} /></button>
          <button className="win-btn" onClick={handleMaximize} title="Phóng to"><Square size={14} /></button>
          <button className="win-btn close" onClick={handleClose} title="Đóng"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}
