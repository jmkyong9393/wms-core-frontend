'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { notificationActionErrorAtom } from '@/features/notifications/store/notificationAtoms';

// 알림 읽음/전체 읽음 처리 실패 시 보여주는 오류 메시지
export function NotificationActionErrorToast() {
  const [message, setMessage] = useAtom(notificationActionErrorAtom);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="px-4 py-3 rounded-xl shadow-lg font-medium text-xs text-center backdrop-blur-md bg-red-500/90 text-white">
        {message}
      </div>
    </div>
  );
}
