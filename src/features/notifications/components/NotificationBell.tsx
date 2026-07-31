'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { Bell } from 'lucide-react';
import {
  notificationsAtom,
  unreadNotificationCountAtom,
} from '@/features/notifications/store/notificationAtoms';
import {
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/features/notifications/hooks/useNotificationMutations';
import { NotificationListItem } from '@/features/notifications/components/NotificationListItem';

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 알림 목록과 읽지 않은 알림 수
  const notifications = useAtomValue(notificationsAtom);
  const unreadCount = useAtomValue(unreadNotificationCountAtom);

  // 알림 읽음 처리
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  // 알림 읽음 처리 및 연결 화면 이동
  const handleItemClick = (id: string) => {
    markReadMutation.mutate(id);

    const item = notifications.find((n) => n.id === id);

    // 발주 추천 알림 클릭 시 해당 추천안 상세 열기
    if (item?.category === 'RESTOCK_ALERT' && item.payload?.orderProposalId) {
      setOpen(false);
      router.push(`/admin/restock?proposalId=${item.payload.orderProposalId}`);
    }
  };


  // 알림창 바깥을 클릭하면 닫기
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-xl border border-gray-100 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">알림</span>
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              모두 읽음
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">새로운 알림이 없습니다</p>
            ) : (
              notifications.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
