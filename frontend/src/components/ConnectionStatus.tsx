import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50">
      <WifiOff className="h-4 w-4" />
      <span>You are currently offline</span>
    </div>
  );
};

export default ConnectionStatus;