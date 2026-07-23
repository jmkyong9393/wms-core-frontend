import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useHitlQueueAction } from './useHitlQueueAction';
import { hitlQueueAtom, hitlActionErrorAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { submitHitlDecision, startReviewHitlItem } from '@/features/queue/api/hitlQueueService';
import type { HitlDecisionResponse } from '@/features/queue/api/hitlQueueService';

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

// 매 테스트마다 격리된 jotai/react-query 컨텍스트로 훅을 렌더링
function setupHook(initialQueue: HitlQueueItem[] = [seedItem]) {
  const store = createStore();
  store.set(hitlQueueAtom, initialQueue);
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
      // 첫 요청이 아직 처리 중인 같은 틱에서 곧바로 재시도(연타 시나리오)
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
});
