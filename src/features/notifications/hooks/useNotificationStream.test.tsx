import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useNotificationStream } from './useNotificationStream';
import {
  notificationsAtom,
  unreadNotificationCountAtom,
} from '@/features/notifications/store/notificationAtoms';
import { MOCK_INTERVAL_MAX_MS } from '@/features/notifications/constants/notificationConfig';
import { listNotifications, issueNotificationStreamTicket } from '@/features/notifications/api/notificationService';
import type { NotificationListResult, NotificationStreamTicket } from '@/features/notifications/types/notification';

vi.mock('@/features/notifications/api/notificationService', () => ({
  listNotifications: vi.fn(),
  issueNotificationStreamTicket: vi.fn(),
}));

// 테스트용 localStorage 설정
vi.hoisted(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  });
});

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  close = vi.fn();
  onerror: ((event: Event) => void) | null = null;
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, callback: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(callback);
  }

  dispatch(type: string, payload: unknown) {
    const event = { data: JSON.stringify(payload) } as MessageEvent;
    this.listeners[type]?.forEach((cb) => cb(event));
  }

  dispatchRaw(type: string, rawData: string) {
    const event = { data: rawData } as MessageEvent;
    this.listeners[type]?.forEach((cb) => cb(event));
  }

  triggerError() {
    this.onerror?.(new Event('error'));
  }
}

async function flushMicrotasks(times = 6) {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

function setupHook() {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );
  const rendered = renderHook(() => useNotificationStream(), { wrapper });
  return { ...rendered, store };
}

describe('useNotificationStream', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.clearAllMocks();
    MockEventSource.instances = [];
    vi.stubGlobal('EventSource', MockEventSource);
    vi.mocked(listNotifications).mockResolvedValue({ items: [], unreadCount: 0 } as NotificationListResult);
    vi.mocked(issueNotificationStreamTicket).mockResolvedValue({
      ticket: 'default-ticket',
      expiresIn: 300,
    } as NotificationStreamTicket);
  });

  afterEach(() => {
    vi.useRealTimers();
    // localStorage 스텁 유지
  });

  describe('mock mode', () => {
    it('injects mock notifications when mock mode is enabled', () => {
      localStorage.setItem('wms_mock_mode', 'true');
      const { store } = setupHook();

      vi.advanceTimersByTime(MOCK_INTERVAL_MAX_MS);

      expect(store.get(notificationsAtom).length).toBeGreaterThan(0);
    });

    it('injects no notifications when mock mode is disabled', () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { store } = setupHook();

      vi.advanceTimersByTime(MOCK_INTERVAL_MAX_MS);

      expect(store.get(notificationsAtom)).toHaveLength(0);
    });
  });

  describe('real mode: ordering', () => {
    it('does not issue a stream ticket or open an EventSource until the initial list fetch settles', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      let resolveList!: (value: NotificationListResult) => void;
      vi.mocked(listNotifications).mockImplementationOnce(
        () => new Promise((resolve) => { resolveList = resolve; })
      );

      setupHook();
      await flushMicrotasks();

      expect(issueNotificationStreamTicket).not.toHaveBeenCalled();
      expect(MockEventSource.instances).toHaveLength(0);

      await act(async () => {
        resolveList({ items: [], unreadCount: 0 });
        await flushMicrotasks();
      });

      expect(issueNotificationStreamTicket).toHaveBeenCalledTimes(1);
      expect(MockEventSource.instances).toHaveLength(1);
    });

    it('still opens the SSE connection after the list fetch fails', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(listNotifications).mockRejectedValueOnce(new Error('list failed'));

      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(issueNotificationStreamTicket).toHaveBeenCalledTimes(1);
      expect(MockEventSource.instances).toHaveLength(1);
    });
  });

  describe('real mode: list + SSE', () => {
    it('hydrates the list from the GET response', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(listNotifications).mockResolvedValueOnce({
        items: [
          {
            id: 'srv-1',
            category: 'FDS_ALERT',
            severity: 'HIGH',
            title: '서버 알림',
            message: '메시지',
            timestamp: '2026-07-28T04:29:44.850691',
            read: false,
          },
        ],
        unreadCount: 1,
      });

      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(store.get(notificationsAtom)).toHaveLength(1);
      expect(store.get(unreadNotificationCountAtom)).toBe(1);
    });

    it('adds a new item on a notification event and ignores a duplicate id', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];
      const payload = {
        id: 'sse-1',
        category: 'AGENT_ALERT',
        severity: 'MEDIUM',
        title: 'SSE 알림',
        message: '실시간 수신',
        timestamp: '2026-07-28T05:00:00.000000',
        read: false,
      };

      // 새 알림 추가
      act(() => {
        es.dispatch('notification', payload);
      });
      expect(store.get(notificationsAtom)).toHaveLength(1);
      expect(store.get(unreadNotificationCountAtom)).toBe(1);

      // 중복 알림 제외
      act(() => {
        es.dispatch('notification', payload);
      });
      expect(store.get(notificationsAtom)).toHaveLength(1);
      expect(store.get(unreadNotificationCountAtom)).toBe(1);
    });

    it('adds an FDS_ALERT item via the same notification event path as other categories, with HIGH severity', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];
      const fdsPayload = {
        id: 'fds-1',
        category: 'FDS_ALERT',
        severity: 'HIGH',
        title: '반품·환불 이상거래 탐지',
        message: '홍길동 고객의 이상거래가 탐지되었습니다. 90일간 반품 5건, 환불 요청 4건.',
        // 백엔드의 offset 없는 UTC 형식
        timestamp: '2026-07-29T01:23:45.678901',
        read: false,
      };

      act(() => {
        es.dispatch('notification', fdsPayload);
      });

      const items = store.get(notificationsAtom);
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ id: 'fds-1', category: 'FDS_ALERT', severity: 'HIGH' });
      expect(store.get(unreadNotificationCountAtom)).toBe(1);

      // 동일 ID 중복 수신 제외
      act(() => {
        es.dispatch('notification', fdsPayload);
      });
      expect(store.get(notificationsAtom)).toHaveLength(1);
      expect(store.get(unreadNotificationCountAtom)).toBe(1);
    });

    it('does not throw and leaves the list unchanged when the notification payload is malformed JSON', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];
      // 잘못된 JSON 수신
      expect(() => {
        act(() => {
          es.dispatchRaw('notification', '{not valid json');
        });
      }).not.toThrow();
      expect(store.get(notificationsAtom)).toHaveLength(0);
    });

    it('closes the connection and does not reconnect automatically when EventSource reports an error', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];

      // SSE 오류 발생
      act(() => {
        es.triggerError();
      });

      expect(es.close).toHaveBeenCalledTimes(1);
      expect(MockEventSource.instances).toHaveLength(1);
    });

    it('closes the EventSource on unmount', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { unmount } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];

      // 훅 종료 시 연결 해제
      unmount();

      expect(es.close).toHaveBeenCalledTimes(1);
    });
  });
});
