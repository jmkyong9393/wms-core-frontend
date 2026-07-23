import { atom } from 'jotai';
import type { NotificationItem, NotificationInput } from '@/features/notifications/types/notification';
import { MAX_NOTIFICATION_HISTORY } from '@/features/notifications/constants/notificationConfig';

// 알림 목록
export const notificationsAtom = atom<NotificationItem[]>([]);

// 읽지 않은 알림 개수
export const unreadNotificationCountAtom = atom((get) =>
  get(notificationsAtom).filter((n) => !n.read).length
);

// 현재 표시 중인 토스트 목록
export const activeToastsAtom = atom<NotificationItem[]>([]);

// 새 알림 추가
export const pushNotificationAtom = atom(null, (get, set, input: NotificationInput) => {
  const item: NotificationItem = {
    ...input,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  set(notificationsAtom, (prev) => [item, ...prev].slice(0, MAX_NOTIFICATION_HISTORY));
  set(activeToastsAtom, (prev) => [...prev, item]);
});

// 토스트 닫기
export const dismissToastAtom = atom(null, (get, set, id: string) => {
  set(activeToastsAtom, (prev) => prev.filter((t) => t.id !== id));
});

// 개별 알림 읽음 처리
export const markNotificationReadAtom = atom(null, (get, set, id: string) => {
  set(notificationsAtom, (prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
});

// 전체 알림 읽음 처리
export const markAllNotificationsReadAtom = atom(null, (get, set) => {
  set(notificationsAtom, (prev) => prev.map((n) => ({ ...n, read: true })));
});
