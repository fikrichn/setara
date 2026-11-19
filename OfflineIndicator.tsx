import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#11241E] px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-white/10"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" aria-hidden="true" />
      <span>Mode Tanpa Internet — Progres tersimpan di perangkat</span>
    </div>
  );
};
