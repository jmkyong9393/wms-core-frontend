import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useNotificationStream } from './useNotificationStream';
import { notificationsAtom } from '@/features/notifications/store/notificationAtoms';
import { MOCK_INTERVAL_MAX_MS } from '@/features/notifications/constants/notificationConfig';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
