'use client';

import type { NotificationItem } from '@/features/notifications/types/notification';
import {
  NOTIFICATION_CATEGORY_LABEL,
  NOTIFICATION_SEVERITY_STYLE,
} from '@/features/notifications/constants/notificationDisplay';
import { formatRelativeTime } from '@/features/notifications/utils/formatRelativeTime';
import { getProposalSourceBadgeStyle, getProposalSourceLabel } from '@/features/restock/utils/statusBadge';

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
      className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
        item.read ? '' : 'bg-blue-50/50 dark:bg-blue-950/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badgeClass}`}>
            {NOTIFICATION_CATEGORY_LABEL[item.category]}
          </span>
          {item.category === 'RESTOCK_ALERT' && item.payload?.proposalSource && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getProposalSourceBadgeStyle(item.payload.proposalSource)}`}
            >
              {getProposalSourceLabel(item.payload.proposalSource)}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {!item.read && <span className={`h-1.5 w-1.5 rounded-full ${style.dotClass}`} />}
          {formatRelativeTime(item.timestamp)}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground">{item.title}</p>
      <p className="text-xs text-muted-foreground">{item.message}</p>
    </button>
  );
}
