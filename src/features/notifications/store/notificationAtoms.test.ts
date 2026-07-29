import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import {
  notificationsAtom,
  activeToastsAtom,
  unreadNotificationCountAtom,
  pushNotificationAtom,
  pushRealNotificationAtom,
  dismissToastAtom,
  markNotificationReadAtom,
  markAllNotificationsReadAtom,
  setNotificationListAtom,
  restoreNotificationAtom,
  restoreNotificationsByIdsAtom,
} from './notificationAtoms';
import type { NotificationInput, NotificationItem } from '@/features/notifications/types/notification';
import { MAX_NOTIFICATION_HISTORY } from '@/features/notifications/constants/notificationConfig';

// 테스트용 알림 데이터
const fdsInput: NotificationInput = {
  category: 'FDS_ALERT',
  severity: 'HIGH',
  title: 'FDS 이상거래 적발',
  message: '위험점수 87점',
};

const agentInput: NotificationInput = {
  category: 'AGENT_ALERT',
  severity: 'MEDIUM',
  title: 'Vision 신뢰도 낮음',
  message: '재검토가 필요합니다',
};

function makeItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: 'srv-1',
    category: 'FDS_ALERT',
    severity: 'HIGH',
    title: '서버 알림',
    message: '서버에서 발급한 알림',
    timestamp: '2026-07-28T04:29:44.850691',
    read: false,
    ...overrides,
  };
}

describe('notificationAtoms', () => {
  let store: ReturnType<typeof createStore>;

  // 테스트마다 새로운 상태 저장소 생성
  beforeEach(() => {
    store = createStore();
  });

  it('pushNotificationAtom inserts a new item at the head of history and into the toast queue', () => {
    store.set(pushNotificationAtom, fdsInput);

    const history = store.get(notificationsAtom);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ ...fdsInput, read: false });
    expect(history[0].id).toBeTruthy();
    expect(history[0].timestamp).toBeTruthy();

    const toasts = store.get(activeToastsAtom);
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(history[0].id);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('keeps the most recent notification first', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);

    const history = store.get(notificationsAtom);
    expect(history[0].category).toBe('AGENT_ALERT');
    expect(history[1].category).toBe('FDS_ALERT');
  });

  it('caps history at MAX_NOTIFICATION_HISTORY', () => {
    for (let i = 0; i < MAX_NOTIFICATION_HISTORY + 5; i += 1) {
      store.set(pushNotificationAtom, fdsInput);
    }
    expect(store.get(notificationsAtom)).toHaveLength(MAX_NOTIFICATION_HISTORY);
  });

  it('dismissToastAtom removes only from the toast queue, not from history', () => {
    store.set(pushNotificationAtom, fdsInput);
    const [item] = store.get(notificationsAtom);

    store.set(dismissToastAtom, item.id);

    expect(store.get(activeToastsAtom)).toHaveLength(0);
    expect(store.get(notificationsAtom)).toHaveLength(1);
  });

  it('markNotificationReadAtom marks only the targeted item as read and decrements unread count', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);
    const [latest, older] = store.get(notificationsAtom);

    store.set(markNotificationReadAtom, latest.id);

    const history = store.get(notificationsAtom);
    expect(history.find((n) => n.id === latest.id)?.read).toBe(true);
    expect(history.find((n) => n.id === older.id)?.read).toBe(false);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('markNotificationReadAtom is a no-op when the item is already read', () => {
    store.set(pushNotificationAtom, fdsInput);
    const [item] = store.get(notificationsAtom);
    store.set(markNotificationReadAtom, item.id);
    expect(store.get(unreadNotificationCountAtom)).toBe(0);

    store.set(markNotificationReadAtom, item.id);
    expect(store.get(unreadNotificationCountAtom)).toBe(0);
  });

  it('markAllNotificationsReadAtom marks every item as read and zeroes unread count', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);

    store.set(markAllNotificationsReadAtom);

    expect(store.get(notificationsAtom).every((n) => n.read)).toBe(true);
    expect(store.get(unreadNotificationCountAtom)).toBe(0);
  });

  it('unreadNotificationCountAtom tracks pushes and reads explicitly (not derived from the array)', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);
    expect(store.get(unreadNotificationCountAtom)).toBe(2);

    const [latest] = store.get(notificationsAtom);
    store.set(markNotificationReadAtom, latest.id);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('setNotificationListAtom hydrates the list and unread count from the GET response', () => {
    const items = [makeItem({ id: 'a', read: false }), makeItem({ id: 'b', read: true })];
    store.set(setNotificationListAtom, { items, unreadCount: 1 });

    expect(store.get(notificationsAtom)).toEqual(items);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('pushRealNotificationAtom prepends a new SSE item and increments unread count', () => {
    const item = makeItem({ id: 'sse-1' });
    store.set(pushRealNotificationAtom, item);

    expect(store.get(notificationsAtom)).toEqual([item]);
    expect(store.get(activeToastsAtom)).toEqual([item]);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('pushRealNotificationAtom ignores a duplicate id delivery', () => {
    const item = makeItem({ id: 'sse-1' });
    store.set(pushRealNotificationAtom, item);
    store.set(pushRealNotificationAtom, item);

    expect(store.get(notificationsAtom)).toHaveLength(1);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('restoreNotificationAtom restores only the targeted item without touching others', () => {
    const item = makeItem({ id: 'a' });
    const other = makeItem({ id: 'b' });
    store.set(setNotificationListAtom, { items: [item, other], unreadCount: 2 });

    // 읽음 상태 먼저 반영
    store.set(markNotificationReadAtom, 'a');
    expect(store.get(unreadNotificationCountAtom)).toBe(1);

    // 실패 시 이전 상태 복구
    store.set(restoreNotificationAtom, item);
    expect(store.get(notificationsAtom).find((n) => n.id === 'a')?.read).toBe(false);
    expect(store.get(notificationsAtom).find((n) => n.id === 'b')).toEqual(other);
    expect(store.get(unreadNotificationCountAtom)).toBe(2);
  });

  it('restoreNotificationsByIdsAtom only reverts ids that are currently read, and adds only the reverted count', () => {
    const a = makeItem({ id: 'a', read: true });
    const b = makeItem({ id: 'b', read: true });
    // 요청 중 들어온 새 SSE 알림
    const c = makeItem({ id: 'c', read: false });
    store.set(setNotificationListAtom, { items: [a, b, c], unreadCount: 1 });

    store.set(restoreNotificationsByIdsAtom, ['a', 'b']);

    const result = store.get(notificationsAtom);
    expect(result.find((n) => n.id === 'a')?.read).toBe(false);
    expect(result.find((n) => n.id === 'b')?.read).toBe(false);
    expect(result.find((n) => n.id === 'c')?.read).toBe(false);
    expect(store.get(unreadNotificationCountAtom)).toBe(3);
  });

  it('restoreNotificationsByIdsAtom does not double-count an id that is already read:false', () => {
    const a = makeItem({ id: 'a', read: false });
    store.set(setNotificationListAtom, { items: [a], unreadCount: 1 });

    store.set(restoreNotificationsByIdsAtom, ['a']);

    expect(store.get(notificationsAtom)[0].read).toBe(false);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });
});
