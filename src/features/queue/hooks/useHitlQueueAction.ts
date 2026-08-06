'use client';

import { useRef } from 'react';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { hitlActionErrorAtom } from '@/features/queue/store/queueAtoms';
import {
  startReviewHitlItem,
  submitHitlDecision,
  type HitlDecisionPayload,
} from '@/features/queue/api/hitlQueueService';

export function useHitlQueueAction() {
  const queryClient = useQueryClient();
  const setActionError = useSetAtom(hitlActionErrorAtom);

  const isStartReviewInFlightRef = useRef(false);
  const isDecisionInFlightRef = useRef(false);

  const refreshHitlBoard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['hitlQueue'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['hitlQueueMetrics'],
      }),
    ]);
  };

  const startReviewMutation = useMutation({
    mutationKey: ['hitlStartReview'],
    mutationFn: (jobId: string) => startReviewHitlItem(jobId),
    onSuccess: refreshHitlBoard,
    onError: () => {
      setActionError(
        '검토 시작에 실패했습니다. 다른 관리자가 이미 검토 중인지 확인해 주세요.'
      );
    },
  });

  const decisionMutation = useMutation({
    mutationKey: ['hitlDecision'],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: HitlDecisionPayload;
    }) => submitHitlDecision(id, payload),
    onSuccess: refreshHitlBoard,
    onError: () => {
      setActionError(
        '검수 처리 요청에 실패했습니다. 다시 시도해 주세요.'
      );
    },
  });

  const startReview = (id: string) => {
    if (isStartReviewInFlightRef.current) return;

    isStartReviewInFlightRef.current = true;
    startReviewMutation.mutate(id, {
      onSettled: () => {
        isStartReviewInFlightRef.current = false;
      },
    });
  };

  const runDecision = (
    id: string,
    payload: HitlDecisionPayload
  ) => {
    if (isDecisionInFlightRef.current) {
      return Promise.reject(
        new Error('이미 처리 중입니다. 잠시 후 다시 시도해 주세요.')
      );
    }

    isDecisionInFlightRef.current = true;

    return decisionMutation
      .mutateAsync({ id, payload })
      .finally(() => {
        isDecisionInFlightRef.current = false;
      });
  };

  return {
    startReview,
    runDecision,
    isLoading:
      startReviewMutation.isPending ||
      decisionMutation.isPending,
  };
}