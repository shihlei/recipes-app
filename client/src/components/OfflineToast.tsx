import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

/** Listens for online/offline events and fires toasts accordingly. */
export default function OfflineToast() {
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      if (wasOffline.current) return;
      wasOffline.current = true;
      toast({
        title: '📡 You are offline',
        description: 'Showing cached data. Your Favorites are still available.',
        duration: 8000,
      });
    };

    const handleOnline = () => {
      wasOffline.current = false;
      toast({ title: '✅ Back online!', duration: 3000 });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Fire immediately if already offline when component mounts
    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
