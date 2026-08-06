import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useHitlQueueAction } from './useHitlQueueAction';
import { hitlActionErrorAtom } from '@/features/queue/store/queueAtoms';
import {
  startReviewHitlItem,
  submitHitlDecision,
} from '@/features/queue/api/hitlQueueService';

vi.mock('@/features/queue/api/hitlQueueService', () => ({
  startReviewHitlItem: vi.fn(),
  submitHitlDecision: vi.fn(),
}));

function setupHook() {
  const store = createStore();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  );

  return {
    ...renderHook(() => useHitlQueueAction(), { wrapper }),
    store,
    queryClient,
  };
}

describe('useHitlQueueAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검토 시작 API 호출 후 HITL 보드와 KPI를 갱신한다', async () => {
    vi.mocked(startReviewHitlItem).mockResolvedValueOnce({
      job_id: 'hitl_2',
      status: 'HITL_REQUIRED',
      reviewer_id: 'admin_1',
      reviewer_employee_id: 'NZ2608001',
      review_started_at: '2026-08-06T10:00:00',
      already_claimed_by_me: false,
      message: '검토를 시작했습니다.',
    });

    const { result, queryClient } = setupHook();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => {
      result.current.startReview('hitl_2');
    });

    await waitFor(() => {
      expect(startReviewHitlItem).toHaveBeenCalledWith('hitl_2');
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['hitlQueue'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['hitlQueueMetrics'],
      });
    });
  });

  it('관리자 판정 API 호출 후 HITL 보드와 KPI를 갱신한다', async () => {
    vi.mocked(submitHitlDecision).mockResolvedValueOnce({
      jobId: 'hitl_1',
      action: 'APPROVE_NORMAL',
      status: 'PROCESSING',
      taskId: 'task_1',
      message: '승인 처리되었습니다.',
    });

    const { result, queryClient } = setupHook();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

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

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['hitlQueue'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['hitlQueueMetrics'],
    });
  });

  it('관리자 판정 실패 시 오류 메시지를 저장하고 예외를 반환한다', async () => {
    vi.mocked(submitHitlDecision).mockRejectedValueOnce(
      new Error('network error')
    );

    const { result, store } = setupHook();

    await act(async () => {
      await expect(
        result.current.runDecision('hitl_1', {
          action: 'APPROVE_NORMAL',
          reviewerReasonCode: 'FP_SHADOW',
        })
      ).rejects.toThrow('network error');
    });

    expect(store.get(hitlActionErrorAtom)).not.toBeNull();
  });

  it('처리 중인 판정 요청을 중복 전송하지 않는다', async () => {
    let resolveDecision!: (value: {
      jobId: string;
      action: 'APPROVE_NORMAL';
      status: 'PROCESSING';
      taskId: string | null;
      message: string;
    }) => void;

    vi.mocked(submitHitlDecision).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDecision = resolve;
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

      secondPromise = result.current.runDecision('hitl_1', {
        action: 'APPROVE_NORMAL',
        reviewerReasonCode: 'FP_SHADOW',
      });
    });

    await expect(secondPromise).rejects.toThrow();
    expect(submitHitlDecision).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDecision({
        jobId: 'hitl_1',
        action: 'APPROVE_NORMAL',
        status: 'PROCESSING',
        taskId: 'task_1',
        message: 'ok',
      });

      await firstPromise;
    });
  });
});