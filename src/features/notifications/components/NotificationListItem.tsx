'use client';

import type { NotificationItem } from '@/features/notifications/types/notification';
import {
  NOTIFICATION_TYPE_LABEL,
  NOTIFICATION_SEVERITY_STYLE,
} from '@/features/notifications/constants/notificationDisplay';
import { formatRelativeTime } from '@/features/notifications/utils/formatRelativeTime';

interface NotificationListItemProps {
  item: NotificationItem;
  onClick: (id: string) => void;
}

export function NotificationListItem({ item, onClick }: NotificationListItemProps) {
  const style = NOTIFICATION_SEVERITY_STYLE[item.severity];

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
        item.read ? '' : 'bg-blue-50/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badgeClass}`}>
          {NOTIFICATION_TYPE_LABEL[item.type]}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
          {!item.read && <span className={`h-1.5 w-1.5 rounded-full ${style.dotClass}`} />}
          {formatRelativeTime(item.timestamp)}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
      <p className="text-xs text-gray-500">{item.message}</p>
    </button>
  );
}
