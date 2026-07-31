'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import type { NotificationItem } from '@/features/notifications/types/notification';
import { NOTIFICATION_SEVERITY_STYLE } from '@/features/notifications/constants/notificationDisplay';
import {
  TOAST_AUTO_DISMISS_MS,
  RESTOCK_ALERT_TOAST_AUTO_DISMISS_MS,
} from '@/features/notifications/constants/notificationConfig';
import { dismissToastAtom } from '@/features/notifications/store/notificationAtoms';
import { useMarkNotificationReadMutation } from '@/features/notifications/hooks/useNotificationMutations';
import { getRestockAlertHref } from '@/features/notifications/utils/getRestockAlertHref';
import { getRiskBadgeStyle, getRiskLabel } from '@/features/restock/utils/statusBadge';

interface NotificationToastProps {
  item: NotificationItem;
}

export function NotificationToast({ item }: NotificationToastProps) {
  const router = useRouter();
  const dismissToast = useSetAtom(dismissToastAtom);
  const markReadMutation = useMarkNotificationReadMutation();

  const isRestockAlert = item.category === 'RESTOCK_ALERT' && !!item.payload;
  const dismissDelay = isRestockAlert ? RESTOCK_ALERT_TOAST_AUTO_DISMISS_MS : TOAST_AUTO_DISMISS_MS;

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(item.id), dismissDelay);
    return () => clearTimeout(timer);
  }, [item.id, dismissToast, dismissDelay]);

  const style = NOTIFICATION_SEVERITY_STYLE[item.severity];

  // "바로 보기" 클릭 시 읽음 처리 결과를 기다리지 않고 바로 이동 + 토스트 닫기
  const handleViewClick = () => {
    markReadMutation.mutate(item.id);
    dismissToast(item.id);
    if (item.payload) {
      router.push(getRestockAlertHref(item.payload.orderProposalId));
    }
  };

  if (isRestockAlert && item.payload) {
    return (
      <div className={`relative rounded-xl px-4 py-3 shadow-lg backdrop-blur-md ${style.toastClass}`}>
        <button
          type="button"
          onClick={() => dismissToast(item.id)}
          aria-label="닫기"
          className="absolute right-2 top-2 rounded-full p-0.5 opacity-70 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <p className="pr-5 text-xs font-semibold">{item.title}</p>
        <p className="mt-0.5 pr-5 text-xs opacity-90">{item.message}</p>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
            추천 {item.payload.recommendedOrderQuantity}권
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getRiskBadgeStyle(item.payload.riskLevel)}`}
          >
            위험도 {getRiskLabel(item.payload.riskLevel)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleViewClick}
          className="mt-2 w-full rounded-lg bg-white/20 py-1.5 text-[11px] font-semibold transition-colors hover:bg-white/30"
        >
          바로 보기
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl px-4 py-3 shadow-lg backdrop-blur-md ${style.toastClass}`}>
      <p className="text-xs font-semibold">{item.title}</p>
      <p className="mt-0.5 text-xs opacity-90">{item.message}</p>
    </div>
  );
}
