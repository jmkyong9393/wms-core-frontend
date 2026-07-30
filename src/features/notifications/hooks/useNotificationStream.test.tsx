import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import {
  useNotificationStream,
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
  MAX_RECONNECT_ATTEMPTS,
} from './useNotificationStream';
import {
  notificationsAtom,
  unreadNotificationCountAtom,
} from '@/features/notifications/store/notificationAtoms';
import { authTokenAtom } from '@/features/auth/store/authAtoms';
import { MOCK_INTERVAL_MAX_MS } from '@/features/notifications/constants/notificationConfig';
import { listNotifications, issueNotificationStreamTicket } from '@/features/notifications/api/notificationService';
import { refreshAccessToken } from '@/features/auth/api/authService';
import type { NotificationListResult, NotificationStreamTicket } from '@/features/notifications/types/notification';

vi.mock('@/features/notifications/api/notificationService', () => ({
  listNotifications: vi.fn(),
  issueNotificationStreamTicket: vi.fn(),
}));

vi.mock('@/features/auth/api/authService', () => ({
  refreshAccessToken: vi.fn(),
}));

function unauthorizedError() {
  return Object.assign(new Error('Unauthorized'), {
    isAxiosError: true,
    response: { status: 401 },
  });
}

function networkError() {
  return Object.assign(new Error('Network Error'), { isAxiosError: true });
}

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
  onopen: (() => void) | null = null;
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

  triggerOpen() {
    this.onopen?.();
  }
}

async function flushMicrotasks(times = 6) {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

// 타이머 진행 후 비동기 처리까지 완료
async function advanceAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await flushMicrotasks();
  });
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

    it('closes the current connection immediately when EventSource reports an error', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];

      // 오류 발생 시 현재 연결 종료
      act(() => {
        es.triggerError();
      });

      expect(es.close).toHaveBeenCalledTimes(1);
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

  describe('real mode: reconnect backoff', () => {
    it('does not reconnect before the backoff delay elapses, then reconnects after it does', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.triggerError();
      });
      expect(es.close).toHaveBeenCalledTimes(1);

      // 대기시간 전에는 재연결하지 않음
      await advanceAndFlush(RECONNECT_BASE_DELAY_MS - 1);
      expect(MockEventSource.instances).toHaveLength(1);

      // 대기시간 후 새로 연결
      await advanceAndFlush(1);
      expect(MockEventSource.instances).toHaveLength(2);
    });

    it('retries with exponential backoff and stops permanently after MAX_RECONNECT_ATTEMPTS', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      let es = MockEventSource.instances[0];
      for (let attempt = 0; attempt < MAX_RECONNECT_ATTEMPTS; attempt += 1) {
        const expectedDelay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attempt,
          RECONNECT_MAX_DELAY_MS
        );
        act(() => {
          es.triggerError();
        });
        await advanceAndFlush(expectedDelay);
        // 재연결 횟수 확인
        expect(MockEventSource.instances).toHaveLength(attempt + 2);
        es = MockEventSource.instances[MockEventSource.instances.length - 1];
      }

      // 최대 횟수 이후에는 재연결 중단
      const finalCount = MockEventSource.instances.length;
      act(() => {
        es.triggerError();
      });
      await advanceAndFlush(RECONNECT_MAX_DELAY_MS * 2);
      expect(MockEventSource.instances).toHaveLength(finalCount);
    });

    it('resets the backoff counter to the base delay after a successful reconnect', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      let es = MockEventSource.instances[0];

      // 첫 실패 후 기본 대기시간 적용
      act(() => {
        es.triggerError();
      });
      await advanceAndFlush(RECONNECT_BASE_DELAY_MS);
      expect(MockEventSource.instances).toHaveLength(2);
      es = MockEventSource.instances[1];

      // 연결 성공 시 재시도 횟수 초기화
      act(() => {
        es.triggerOpen();
      });

      // 다시 실패해도 기본 대기시간부터 시작
      act(() => {
        es.triggerError();
      });
      await advanceAndFlush(RECONNECT_BASE_DELAY_MS - 1);
      expect(MockEventSource.instances).toHaveLength(2);

      await advanceAndFlush(1);
      expect(MockEventSource.instances).toHaveLength(3);
    });

    it('re-fetches the notification list on every reconnect attempt to resync missed events', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(listNotifications).toHaveBeenCalledTimes(1);

      const es = MockEventSource.instances[0];
      act(() => {
        es.triggerError();
      });
      await advanceAndFlush(RECONNECT_BASE_DELAY_MS);

      expect(listNotifications).toHaveBeenCalledTimes(2);
    });

    it('clears the pending reconnect timer on unmount so no further reconnect happens', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      const { unmount } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.triggerError();
      });
      expect(es.close).toHaveBeenCalledTimes(1);

      unmount();

      await advanceAndFlush(RECONNECT_MAX_DELAY_MS * 2);
      expect(MockEventSource.instances).toHaveLength(1);
    });
  });

  describe('real mode: 401 → Access Token 갱신', () => {
    it('refreshes the token and opens the stream with a newly issued ticket when the ticket request is 401', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(issueNotificationStreamTicket)
        .mockRejectedValueOnce(unauthorizedError())
        .mockResolvedValueOnce({ ticket: 'ticket-after-refresh', expiresIn: 300 });
      vi.mocked(refreshAccessToken).mockResolvedValueOnce({ access_token: 'new-token' });

      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(store.get(authTokenAtom)).toBe('new-token');
      expect(MockEventSource.instances).toHaveLength(1);
      expect(MockEventSource.instances[0].url).toContain('ticket-after-refresh');
    });

    it('logs out (no further reconnect) when the Refresh request itself is 401', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(issueNotificationStreamTicket).mockRejectedValueOnce(unauthorizedError());
      vi.mocked(refreshAccessToken).mockRejectedValueOnce(unauthorizedError());

      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(store.get(authTokenAtom)).toBeNull();
      expect(MockEventSource.instances).toHaveLength(0);

      // 로그아웃 이후에는 백오프 재연결도 예약되지 않음
      await advanceAndFlush(RECONNECT_MAX_DELAY_MS * 2);
      expect(MockEventSource.instances).toHaveLength(0);
    });

    it('keeps the session and retries via the normal backoff when Refresh fails with a network/5xx error', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(issueNotificationStreamTicket)
        .mockRejectedValueOnce(unauthorizedError())
        .mockResolvedValueOnce({ ticket: 'ticket-after-retry', expiresIn: 300 });
      vi.mocked(refreshAccessToken).mockRejectedValueOnce(networkError());

      const { store } = setupHook();
      // atomWithStorage(getOnInit)는 모듈 로드 시점에 한 번만 저장소를 읽으므로,
      // 이 store 인스턴스의 기준값을 명시적으로 세팅해서 "세션 유지" 여부를 검증한다
      act(() => {
        store.set(authTokenAtom, 'old-token');
      });
      await act(async () => {
        await flushMicrotasks();
      });

      // 인증 상태는 그대로 유지
      expect(store.get(authTokenAtom)).toBe('old-token');
      expect(MockEventSource.instances).toHaveLength(0);

      await advanceAndFlush(RECONNECT_BASE_DELAY_MS);

      expect(MockEventSource.instances).toHaveLength(1);
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it('logs out without retrying Refresh again when a freshly refreshed token also gets 401 on ticket reissue', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(issueNotificationStreamTicket)
        .mockRejectedValueOnce(unauthorizedError())
        .mockRejectedValueOnce(unauthorizedError());
      vi.mocked(refreshAccessToken).mockResolvedValueOnce({ access_token: 'new-token' });

      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(store.get(authTokenAtom)).toBeNull();
      expect(MockEventSource.instances).toHaveLength(0);

      await advanceAndFlush(RECONNECT_MAX_DELAY_MS * 2);
      expect(MockEventSource.instances).toHaveLength(0);
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it('retries via backoff without calling Refresh again when ticket reissue fails on network/5xx after a successful refresh', async () => {
      localStorage.setItem('wms_mock_mode', 'false');
      vi.mocked(issueNotificationStreamTicket)
        .mockRejectedValueOnce(unauthorizedError())
        .mockRejectedValueOnce(networkError())
        .mockResolvedValueOnce({ ticket: 'ticket-after-second-retry', expiresIn: 300 });
      vi.mocked(refreshAccessToken).mockResolvedValueOnce({ access_token: 'new-token' });

      const { store } = setupHook();
      await act(async () => {
        await flushMicrotasks();
      });

      expect(store.get(authTokenAtom)).toBe('new-token');
      expect(MockEventSource.instances).toHaveLength(0);

      await advanceAndFlush(RECONNECT_BASE_DELAY_MS);

      expect(MockEventSource.instances).toHaveLength(1);
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});
