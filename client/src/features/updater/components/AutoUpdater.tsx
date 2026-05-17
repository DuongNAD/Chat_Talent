import { useState, useEffect } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

export function AutoUpdater() {
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setStatus('checking');
      const update = await check();
      if (update) {
        setUpdateInfo(update);
        setStatus('available');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setStatus('error');
      setErrorMsg(String(err));
      // Auto dismiss error after 5s
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const startUpdate = async () => {
    if (!updateInfo) return;
    try {
      setStatus('downloading');
      let downloaded = 0;
      let contentLength = 0;

      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case 'Finished':
            setStatus('ready');
            break;
        }
      });
      
      setStatus('ready');
    } catch (err) {
      console.error('Update failed:', err);
      setStatus('error');
      setErrorMsg('Lỗi cập nhật: ' + String(err));
    }
  };

  const restartApp = async () => {
    // In Tauri v2, relaunch requires plugin-process, but we can instruct the user
    // or attempt a naive reload if plugin-process isn't installed
    alert('Bản cập nhật đã được cài đặt! Vui lòng khởi động lại ứng dụng.');
  };

  if (status === 'idle' || status === 'checking') return null;

  return (
    <div className="updater-overlay">
      <div className="updater-card">
        {status === 'available' && (
          <>
            <div className="updater-icon"><Download size={32} /></div>
            <h3>Có phiên bản mới!</h3>
            <p>Phiên bản <strong>{updateInfo?.version}</strong> đã sẵn sàng để tải xuống.</p>
            {updateInfo?.body && <p className="release-notes">{updateInfo.body}</p>}
            <div className="updater-actions">
              <button className="updater-btn-cancel" onClick={() => setStatus('idle')}>Bỏ qua</button>
              <button className="updater-btn-primary" onClick={startUpdate}>Cập nhật ngay</button>
            </div>
          </>
        )}

        {status === 'downloading' && (
          <>
            <div className="updater-icon pulse"><Download size={32} /></div>
            <h3>Đang tải xuống...</h3>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{progress}%</p>
          </>
        )}

        {status === 'ready' && (
          <>
            <div className="updater-icon success"><CheckCircle size={32} /></div>
            <h3>Cập nhật thành công!</h3>
            <p>Ứng dụng cần được khởi động lại để áp dụng thay đổi.</p>
            <button className="updater-btn-primary" onClick={restartApp}>Khởi động lại</button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="updater-icon error"><AlertCircle size={32} /></div>
            <h3>Lỗi cập nhật</h3>
            <p>{errorMsg}</p>
            <button className="updater-btn-cancel" onClick={() => setStatus('idle')}>Đóng</button>
          </>
        )}
      </div>
    </div>
  );
}
