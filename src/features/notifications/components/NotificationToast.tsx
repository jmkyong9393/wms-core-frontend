'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import type { NotificationItem } from '@/features/notifications/types/notification';
import { NOTIFICATION_SEVERITY_STYLE } from '@/features/notifications/constants/notificationDisplay';
import { TOAST_AUTO_DISMISS_MS } from '@/features/notifications/constants/notificationConfig';
import { dismissToastAtom } from '@/features/notifications/store/notificationAtoms';

interface NotificationToastProps {
  item: NotificationItem;
}

export function NotificationToast({ item }: NotificationToastProps) {
  const dismissToast = useSetAtom(dismissToastAtom);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(item.id), TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item.id, dismissToast]);

  const style = NOTIFICATION_SEVERITY_STYLE[item.severity];

  return (
    <div className={`rounded-xl px-4 py-3 shadow-lg backdrop-blur-md ${style.toastClass}`}>
      <p className="text-xs font-semibold">{item.title}</p>
      <p className="mt-0.5 text-xs opacity-90">{item.message}</p>
    </div>
  );
}
