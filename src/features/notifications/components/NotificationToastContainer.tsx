'use client';

import { useAtomValue } from 'jotai';
import { activeToastsAtom } from '@/features/notifications/store/notificationAtoms';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';

// 화면에 표시할 최대 토스트 개수
const MAX_VISIBLE_TOASTS = 3;

export function NotificationToastContainer() {
  const toasts = useAtomValue(activeToastsAtom);
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {visibleToasts.map((item) => (
        <NotificationToast key={item.id} item={item} />
      ))}
    </div>
  );
}
