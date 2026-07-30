import { atom } from 'jotai';
import type {
  NotificationItem,
  NotificationInput,
  NotificationListResult,
} from '@/features/notifications/types/notification';
import { MAX_NOTIFICATION_HISTORY } from '@/features/notifications/constants/notificationConfig';

// 알림 목록
export const notificationsAtom = atom<NotificationItem[]>([]);

// 미읽음 알림 개수
// 목록이 잘려도 서버 값과 맞도록 별도 관리
export const unreadNotificationCountAtom = atom<number>(0);

// 현재 표시 중인 토스트 목록
export const activeToastsAtom = atom<NotificationItem[]>([]);

// 읽음 처리 오류 메시지
export const notificationActionErrorAtom = atom<string | null>(null);

// 서버 응답으로 알림 목록 초기화
export const setNotificationListAtom = atom(null, (get, set, result: NotificationListResult) => {
  set(notificationsAtom, result.items);
  set(unreadNotificationCountAtom, result.unreadCount);
});

// Mock 알림 추가
export const pushNotificationAtom = atom(null, (get, set, input: NotificationInput) => {
  const item: NotificationItem = {
    ...input,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  set(notificationsAtom, (prev) => [item, ...prev].slice(0, MAX_NOTIFICATION_HISTORY));
  set(activeToastsAtom, (prev) => [...prev, item]);
  set(unreadNotificationCountAtom, (c) => c + 1);
});

// SSE 알림 추가
// 같은 ID는 중복 추가하지 않음
export const pushRealNotificationAtom = atom(null, (get, set, item: NotificationItem) => {
  const exists = get(notificationsAtom).some((n) => n.id === item.id);
  if (exists) return;
  set(notificationsAtom, (prev) => [item, ...prev].slice(0, MAX_NOTIFICATION_HISTORY));
  set(activeToastsAtom, (prev) => [...prev, item]);
  set(unreadNotificationCountAtom, (c) => c + 1);
});

// 토스트 닫기
export const dismissToastAtom = atom(null, (get, set, id: string) => {
  set(activeToastsAtom, (prev) => prev.filter((t) => t.id !== id));
});

// 개별 알림 읽음 처리
export const markNotificationReadAtom = atom(null, (get, set, id: string) => {
  const target = get(notificationsAtom).find((n) => n.id === id);
  if (!target || target.read) return;
  set(notificationsAtom, (prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  set(unreadNotificationCountAtom, (c) => Math.max(0, c - 1));
});

// 개별 읽음 처리 실패 시 복구
export const restoreNotificationAtom = atom(null, (get, set, previousItem: NotificationItem) => {
  set(notificationsAtom, (prev) =>
    prev.map((n) => (n.id === previousItem.id ? previousItem : n))
  );
  if (!previousItem.read) set(unreadNotificationCountAtom, (c) => c + 1);
});

// 전체 알림 읽음 처리
export const markAllNotificationsReadAtom = atom(null, (get, set) => {
  set(notificationsAtom, (prev) => prev.map((n) => ({ ...n, read: true })));
  set(unreadNotificationCountAtom, 0);
});

// 전체 읽음 처리 실패 시 기존 항목만 복구
export const restoreNotificationsByIdsAtom = atom(null, (get, set, ids: string[]) => {
  const idSet = new Set(ids);
  const current = get(notificationsAtom);
  const restoredCount = current.filter((n) => idSet.has(n.id) && n.read).length;
  if (restoredCount === 0) return;
  set(notificationsAtom, (prev) =>
    prev.map((n) => (idSet.has(n.id) && n.read ? { ...n, read: false } : n))
  );
  set(unreadNotificationCountAtom, (c) => c + restoredCount);
});
