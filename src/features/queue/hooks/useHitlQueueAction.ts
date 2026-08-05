'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from 'jotai';
import {
  hitlQueueAtom,
  hitlActionErrorAtom,
  restoreHitlItemAtom,
  applyHitlDecisionAtom,
  startReviewHitlItemAtom,
  setHitlItemStatusAtom,
  type HitlQueueItem,
  type HitlItemStatus,
} from '@/features/queue/store/queueAtoms';
import {
  submitHitlDecision,
  startReviewHitlItem,
  type HitlDecisionPayload,
} from '@/features/queue/api/hitlQueueService';
import type { HitlDecisionAction } from '@/features/queue/constants/hitlReasonCodes';

interface OptimisticContext {
  previousItem: HitlQueueItem | undefined;
}

// 판정 액션별 최종 확정 상태 — RE_CHECK는 onMutate에서 이미 RECHECK_REQUIRED로 반영되므로 null(변경 없음)
const RESOLVED_STATUS_BY_ACTION: Record<HitlDecisionAction, HitlItemStatus | null> = {
  APPROVE_NORMAL: 'APPROVED',
  APPROVE_DOWNGRADE: 'APPROVED',
  REJECT_RETURN: 'REJECTED',
  REJECT_DISCARD: 'REJECTED',
  RE_CHECK: null,
};

// HITL 큐 검토 시작(드래그) 액션 - 판정 API와 무관한 로컬 상태 전환
export function useHitlQueueAction() {
  const store = useStore();
  const queryClient = useQueryClient();

  const startReviewMutation = useMutation<void, Error, string, OptimisticContext>({
    mutationKey: ['hitlStartReview'],
    mutationFn: (id) => startReviewHitlItem(id),
    onMutate: (id) => {
      const previousItem = store.get(hitlQueueAtom).find((item) => item.id === id);
      store.set(startReviewHitlItemAtom, id);
      return { previousItem };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItem) store.set(restoreHitlItemAtom, context.previousItem);
      store.set(hitlActionErrorAtom, '❌ 서버 오류로 실패했습니다. 다시 시도해 주세요.');
    },
  });

  // 관리자 HITL 최종 판정(승인/반려/재검토) 제출
  const decisionMutation = useMutation<
    void,
    Error,
    { id: string; payload: HitlDecisionPayload },
    OptimisticContext
  >({
    mutationKey: ['hitlDecision'],
    mutationFn: ({ id, payload }) => submitHitlDecision(id, payload).then(() => undefined),
    onMutate: ({ id, payload }) => {
      const previousItem = store.get(hitlQueueAtom).find((item) => item.id === id);
      store.set(applyHitlDecisionAtom, { id, action: payload.action });
      return { previousItem };
    },
    onSuccess: (_data, { id, payload }) => {
      const status = RESOLVED_STATUS_BY_ACTION[payload.action];
      if (status) store.set(setHitlItemStatusAtom, { id, status });
      queryClient.invalidateQueries({ queryKey: ['inspectionMetrics'] });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItem) store.set(restoreHitlItemAtom, context.previousItem);
      store.set(hitlActionErrorAtom, '❌ 서버 오류로 실패했습니다. 다시 시도해 주세요.');
    },
  });

  // mutation.isPending은 다음 렌더에서야 갱신되어 같은 틱 안의 연속 호출을 막지 못하므로
  // ref로 즉시(synchronous) 중복 제출을 차단
  const isStartReviewInFlightRef = useRef(false);
  const isDecisionInFlightRef = useRef(false);

  const startReview = (id: string) => {
    if (isStartReviewInFlightRef.current) return; // 중복 클릭 방지
    isStartReviewInFlightRef.current = true;
    startReviewMutation.mutate(id, {
      onSettled: () => {
        isStartReviewInFlightRef.current = false;
      },
    });
  };

  // 다이얼로그가 실패 시 입력값을 유지한 채 재시도할 수 있도록 Promise를 그대로 반환
  // 이미 처리 중이면 reject하여 다이얼로그가 닫히지 않고 에러를 표시하도록 함(중복 제출 방지)
  const runDecision = (id: string, payload: HitlDecisionPayload) => {
    if (isDecisionInFlightRef.current) {
      return Promise.reject(new Error('이미 처리 중입니다. 잠시 후 다시 시도해 주세요.'));
    }
    isDecisionInFlightRef.current = true;
    return decisionMutation.mutateAsync({ id, payload }).finally(() => {
      isDecisionInFlightRef.current = false;
    });
  };

  return {
    startReview,
    runDecision,
    isLoading: startReviewMutation.isPending || decisionMutation.isPending,
  };
}
