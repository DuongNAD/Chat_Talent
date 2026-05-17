import { useEffect, useState } from 'react';
import { useAuthStore } from '@features/auth/store/authStore';
import { useChatStore } from '@features/chat/store/chatStore';
import { useCallStore } from '@features/call/store/callStore';
import { setupChatSocket } from '@features/chat/services/chat.socket';
import { LoginScreen } from '@features/auth/components/LoginScreen';
import { ChatArea } from '@features/chat/components/ChatArea';
import { MembersPanel } from '@features/chat/components/MembersPanel';
import { CallScreen } from '@features/call/components/CallScreen';
import { IncomingCallPopup } from '@features/call/components/IncomingCallPopup';
import { AutoUpdater } from '@features/updater/components/AutoUpdater';
import { Sidebar } from './components/Sidebar';
import { MomentsFeed } from '@features/moments/components/MomentsFeed';
import { TopNavbar } from './components/TopNavbar';

// CSS imports — each feature owns its styles
import '@shared/styles/globals.css';
import { EventsView } from '@features/events/EventsView';
import { GamesView } from '@features/games/GamesView';
import { LivaView } from '@features/liva/LivaView';
import { SettingsView } from '@features/settings/SettingsView';
import { SupportView } from '@features/support/SupportView';
import '@features/call/call.css';
import '@features/updater/updater.css';
import '@features/auth/auth.css';
import '@features/chat/chat.css';
export default function App() {
  const { isLoggedIn, user, restoreSession } = useAuthStore();
  const [currentView, setCurrentView] = useState('moments');
  
  const loadLobby = useChatStore((s) => s.loadLobby);
  const initCallSocket = useCallStore((s) => s.initCallSocket);
  const callStatus = useCallStore((s) => s.status);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // When logged in → setup sockets + load lobby
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setupChatSocket(token);
    initCallSocket(token);
    loadLobby();
  }, [isLoggedIn, user, loadLobby, initCallSocket]);

  if (!isLoggedIn) {
    return (
      <div className="app-wrapper">
        <TopNavbar />
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <TopNavbar />
      <div className="app-layout">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className={`main-content ${currentView === 'chat' ? 'chat-view' : ''}`}>
        {currentView === 'chat' && (
          <>
            <ChatArea />
            <MembersPanel />
          </>
        )}
        {currentView === 'moments' && <MomentsFeed />}
        {currentView === 'events' && <EventsView />}
        {currentView === 'games' && <GamesView />}
        {currentView === 'liva' && <LivaView />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'support' && <SupportView />}
      </main>

      {/* Call overlays */}
      <IncomingCallPopup />
      {callStatus !== 'idle' && callStatus !== 'ringing' && <CallScreen />}

      {/* Auto updater */}
      <AutoUpdater />
      </div>
    </div>
  );
}
