import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="bg-danger text-white text-center py-2 small" style={{ position: 'sticky', top: 0, zIndex: 1090 }}>
      <i className="bi bi-wifi-off me-2" />
      You are currently offline. Some features may not work.
    </div>
  );
}
