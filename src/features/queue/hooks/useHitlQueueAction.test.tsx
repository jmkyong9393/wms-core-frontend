import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useHitlQueueAction } from './useHitlQueueAction';
import { hitlQueueAtom, hitlActionErrorAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { submitHitlDecision, startReviewHitlItem } from '@/features/queue/api/hitlQueueService';
import type { HitlDecisionResponse } from '@/features/queue/api/hitlQueueService';
import { currentUserAtom } from '@/features/auth/store/authAtoms';
import type { CurrentUser } from '@/features/auth/types/authTypes';

// 테스트용 localStorage 설정
vi.hoisted(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  });
});

vi.mock('@/features/queue/api/hitlQueueService', () => ({
  submitHitlDecision: vi.fn(),
  startReviewHitlItem: vi.fn(),
}));

const seedItem: HitlQueueItem = {
  id: 'hitl_1',
  title: '테스트 도서',
  status: 'IN_PROGRESS',
  reviewer: '관리자A',
};

// AuthGuard를 거치지 않는 훅 단위 테스트이므로 실제 화면에서는 항상 보장되는
// "로그인 완료 상태"를 setupHook 기본값으로 직접 채워준다
const DEFAULT_CURRENT_USER: CurrentUser = {
  id: 'test-user-id',
  employeeId: 'W0001',
  name: '관리자테스트',
  role: 'ADMIN',
  mustChangePassword: false,
};

// 테스트별 독립 상태 생성
function setupHook(initialQueue: HitlQueueItem[] = [seedItem], currentUser: CurrentUser = DEFAULT_CURRENT_USER) {
  const store = createStore();
  store.set(hitlQueueAtom, initialQueue);
  store.set(currentUserAtom, currentUser);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  );

  const rendered = renderHook(() => useHitlQueueAction(), { wrapper });
  return { ...rendered, store };
}

describe('useHitlQueueAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistically moves the item to PROCESSING and calls submitHitlDecision for APPROVE_NORMAL', async () => {
    vi.mocked(submitHitlDecision).mockResolvedValueOnce({
      jobId: 'hitl_1',
      action: 'APPROVE_NORMAL',
      status: 'PROCESSING',
      taskId: 'task-1',
      message: 'ok',
    });

    const { result, store } = setupHook();

    await act(async () => {
      await result.current.runDecision('hitl_1', {
        action: 'APPROVE_NORMAL',
        reviewerReasonCode: 'FP_SHADOW',
      });
    });

    expect(submitHitlDecision).toHaveBeenCalledWith('hitl_1', {
      action: 'APPROVE_NORMAL',
      reviewerReasonCode: 'FP_SHADOW',
    });
    expect(store.get(hitlQueueAtom).find((item) => item.id === 'hitl_1')?.status).toBe('PROCESSING');
  });

  it('moves the item to RECHECK_REQUIRED for RE_CHECK', async () => {
    vi.mocked(submitHitlDecision).mockResolvedValueOnce({
      jobId: 'hitl_1',
      action: 'RE_CHECK',
      status: 'RECHECK_REQUIRED',
      taskId: null,
      message: 'ok',
    });

    const { result, store } = setupHook();

    await act(async () => {
      await result.current.runDecision('hitl_1', {
        action: 'RE_CHECK',
        reviewerReasonCode: 'SYS_BLURRY',
      });
    });

    expect(store.get(hitlQueueAtom).find((item) => item.id === 'hitl_1')?.status).toBe('RECHECK_REQUIRED');
  });

  it('rolls back the status and records an error message when the request fails', async () => {
    vi.mocked(submitHitlDecision).mockRejectedValueOnce(new Error('network error'));

    const { result, store } = setupHook();

    await act(async () => {
      await expect(
        result.current.runDecision('hitl_1', { action: 'APPROVE_NORMAL', reviewerReasonCode: 'FP_SHADOW' })
      ).rejects.toThrow('network error');
    });

    expect(store.get(hitlQueueAtom).find((item) => item.id === 'hitl_1')).toEqual(seedItem);
    expect(store.get(hitlActionErrorAtom)).toMatch(/오류/);
  });

  it('rejects a concurrent duplicate submission without sending a second request', async () => {
    let resolveFirst!: (value: HitlDecisionResponse) => void;
    vi.mocked(submitHitlDecision).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );

    const { result } = setupHook();

    let firstPromise!: Promise<unknown>;
    let secondPromise!: Promise<unknown>;
    act(() => {
      firstPromise = result.current.runDecision('hitl_1', {
        action: 'APPROVE_NORMAL',
        reviewerReasonCode: 'FP_SHADOW',
      });
      // 첫 요청 처리 중 같은 요청 재시도
      secondPromise = result.current.runDecision('hitl_1', {
        action: 'APPROVE_NORMAL',
        reviewerReasonCode: 'FP_SHADOW',
      });
    });

    await expect(secondPromise).rejects.toThrow('이미 처리 중');
    expect(submitHitlDecision).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst({ jobId: 'hitl_1', action: 'APPROVE_NORMAL', status: 'PROCESSING', taskId: null, message: 'ok' });
      await firstPromise;
    });
  });

  it('startReview optimistically transitions AWAITING_REVIEW to IN_PROGRESS', async () => {
    vi.mocked(startReviewHitlItem).mockResolvedValueOnce(undefined);
    const { result, store } = setupHook([{ id: 'hitl_2', status: 'AWAITING_REVIEW' }]);

    act(() => {
      result.current.startReview('hitl_2');
    });

    await waitFor(() => {
      expect(store.get(hitlQueueAtom).find((item) => item.id === 'hitl_2')?.status).toBe('IN_PROGRESS');
    });
  });

  it('startReview sets reviewer to the masked name of the logged-in user', async () => {
    vi.mocked(startReviewHitlItem).mockResolvedValueOnce(undefined);
    const { result, store } = setupHook([{ id: 'hitl_2', status: 'AWAITING_REVIEW' }], {
      id: 'test-user-id-2',
      employeeId: 'W0001',
      name: '장문경',
      role: 'ADMIN',
      mustChangePassword: false,
    });

    act(() => {
      result.current.startReview('hitl_2');
    });

    await waitFor(() => {
      expect(store.get(hitlQueueAtom).find((item) => item.id === 'hitl_2')?.reviewer).toBe('장*경');
    });
  });
});
