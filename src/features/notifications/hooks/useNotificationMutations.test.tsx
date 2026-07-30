import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import {
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from './useNotificationMutations';
import {
  notificationsAtom,
  unreadNotificationCountAtom,
  notificationActionErrorAtom,
  pushRealNotificationAtom,
} from '@/features/notifications/store/notificationAtoms';
import type { NotificationItem } from '@/features/notifications/types/notification';
import {
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '@/features/notifications/api/notificationService';

vi.mock('@/features/notifications/api/notificationService', () => ({
  markNotificationReadApi: vi.fn(),
  markAllNotificationsReadApi: vi.fn(),
}));

const item1: NotificationItem = {
  id: 'n1',
  category: 'FDS_ALERT',
  severity: 'HIGH',
  title: '알림 1',
  message: '메시지 1',
  timestamp: '2026-07-28T00:00:00.000Z',
  read: false,
};

const item2: NotificationItem = {
  id: 'n2',
  category: 'AGENT_ALERT',
  severity: 'MEDIUM',
  title: '알림 2',
  message: '메시지 2',
  timestamp: '2026-07-28T00:01:00.000Z',
  read: false,
};

function setupStore(items: NotificationItem[]) {
  const store = createStore();
  store.set(notificationsAtom, items);
  store.set(unreadNotificationCountAtom, items.filter((n) => !n.read).length);
  return store;
}

function renderMutations(store: ReturnType<typeof createStore>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  );
  return renderHook(
    () => ({
      markRead: useMarkNotificationReadMutation(),
      markAllRead: useMarkAllNotificationsReadMutation(),
    }),
    { wrapper }
  );
}

describe('useNotificationMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a single item read and decrements unread count on success', async () => {
    vi.mocked(markNotificationReadApi).mockResolvedValueOnce(undefined);
    const store = setupStore([item1, item2]);
    const { result } = renderMutations(store);

    act(() => {
      result.current.markRead.mutate('n1');
    });

    await waitFor(() => {
      expect(store.get(notificationsAtom).find((n) => n.id === 'n1')?.read).toBe(true);
    });
    expect(store.get(unreadNotificationCountAtom)).toBe(1);
  });

  it('rolls back the single item and sets an error message when the read request fails', async () => {
    vi.mocked(markNotificationReadApi).mockRejectedValueOnce(new Error('network error'));
    const store = setupStore([item1, item2]);
    const { result } = renderMutations(store);

    act(() => {
      result.current.markRead.mutate('n1');
    });

    await waitFor(() => {
      expect(store.get(notificationActionErrorAtom)).toMatch(/읽음 처리하지 못했/);
    });
    expect(store.get(notificationsAtom).find((n) => n.id === 'n1')?.read).toBe(false);
    expect(store.get(unreadNotificationCountAtom)).toBe(2);
  });

  it('marks all items read and zeroes unread count on success', async () => {
    vi.mocked(markAllNotificationsReadApi).mockResolvedValueOnce(undefined);
    const store = setupStore([item1, item2]);
    const { result } = renderMutations(store);

    act(() => {
      result.current.markAllRead.mutate();
    });

    await waitFor(() => {
      expect(store.get(notificationsAtom).every((n) => n.read)).toBe(true);
    });
    expect(store.get(unreadNotificationCountAtom)).toBe(0);
  });

  it('rolls back only the originally-affected ids when mark-all-read fails, preserving an SSE item that arrived mid-flight', async () => {
    let rejectMarkAll!: (err: Error) => void;
    vi.mocked(markAllNotificationsReadApi).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectMarkAll = reject;
        })
    );
    const store = setupStore([item1, item2]);
    const { result } = renderMutations(store);

    act(() => {
      result.current.markAllRead.mutate();
    });

    // 모두 읽음 상태를 먼저 반영
    expect(store.get(notificationsAtom).every((n) => n.read)).toBe(true);
    expect(store.get(unreadNotificationCountAtom)).toBe(0);

    // API 요청이 시작될 때까지 대기
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const sseItem: NotificationItem = {
      id: 'n3',
      category: 'RESTOCK_ALERT',
      severity: 'LOW',
      title: 'SSE 알림',
      message: 'mid-flight',
      timestamp: '2026-07-28T00:02:00.000Z',
      read: false,
    };

    // 요청 중 새 SSE 알림 추가
    act(() => {
      store.set(pushRealNotificationAtom, sseItem);
    });
    expect(store.get(unreadNotificationCountAtom)).toBe(1);

    // 요청 실패 시 기존 알림만 복구
    act(() => {
      rejectMarkAll(new Error('network error'));
    });

    await waitFor(() => {
      expect(store.get(notificationActionErrorAtom)).toMatch(/모두 읽음 처리하지 못했/);
    });

    const finalItems = store.get(notificationsAtom);
    expect(finalItems.find((n) => n.id === 'n1')?.read).toBe(false);
    expect(finalItems.find((n) => n.id === 'n2')?.read).toBe(false);
    expect(finalItems.find((n) => n.id === 'n3')?.read).toBe(false);
    // 기존 알림 2건과 새 알림 1건
    expect(store.get(unreadNotificationCountAtom)).toBe(3);
  });
});
