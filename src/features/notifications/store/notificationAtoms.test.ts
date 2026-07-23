import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import {
  notificationsAtom,
  activeToastsAtom,
  unreadNotificationCountAtom,
  pushNotificationAtom,
  dismissToastAtom,
  markNotificationReadAtom,
  markAllNotificationsReadAtom,
} from './notificationAtoms';
import type { NotificationInput } from '@/features/notifications/types/notification';
import { MAX_NOTIFICATION_HISTORY } from '@/features/notifications/constants/notificationConfig';

// 테스트용 알림 데이터
const fdsInput: NotificationInput = {
  category: 'FDS',
  severity: 'CRITICAL',
  title: 'FDS 이상거래 적발',
  message: '위험점수 87점',
};

const agentInput: NotificationInput = {
  category: 'AGENT_ANOMALY',
  severity: 'WARNING',
  title: 'Vision 신뢰도 낮음',
  message: '재검토가 필요합니다',
};

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
  });

  it('keeps the most recent notification first', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);

    const history = store.get(notificationsAtom);
    expect(history[0].category).toBe('AGENT_ANOMALY');
    expect(history[1].category).toBe('FDS');
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

  it('markNotificationReadAtom marks only the targeted item as read', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);
    const [latest, older] = store.get(notificationsAtom);

    store.set(markNotificationReadAtom, latest.id);

    const history = store.get(notificationsAtom);
    expect(history.find((n) => n.id === latest.id)?.read).toBe(true);
    expect(history.find((n) => n.id === older.id)?.read).toBe(false);
  });

  it('markAllNotificationsReadAtom marks every item as read', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);

    store.set(markAllNotificationsReadAtom);

    expect(store.get(notificationsAtom).every((n) => n.read)).toBe(true);
  });

  it('unreadNotificationCountAtom derives the count of unread items', () => {
    store.set(pushNotificationAtom, fdsInput);
    store.set(pushNotificationAtom, agentInput);
    expect(store.get(unreadNotificationCountAtom)).toBe(2);

    const [latest] = store.get(notificationsAtom);
    store.set(markNotificationReadAtom, latest.id);
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });
});
