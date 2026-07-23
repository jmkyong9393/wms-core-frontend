'use client';

import { useNotificationStream } from '@/features/notifications/hooks/useNotificationStream';

export function NotificationStreamProvider() {
  useNotificationStream();
  return null;
}
