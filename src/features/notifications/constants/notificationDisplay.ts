import type { NotificationCategory, NotificationSeverity } from '@/features/notifications/types/notification';

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  FDS: 'FDS 이상거래',
  AGENT_ANOMALY: '에이전트 이상감지',
};

export const NOTIFICATION_SEVERITY_STYLE: Record<
  NotificationSeverity,
  { badgeClass: string; dotClass: string; toastClass: string }
> = {
  CRITICAL: {
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
    toastClass: 'bg-red-500/90 text-white',
  },
  WARNING: {
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-500',
    toastClass: 'bg-amber-500/90 text-white',
  },
  INFO: {
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-500',
    toastClass: 'bg-blue-500/90 text-white',
  },
};
