'use client';

import { useMutation } from '@tanstack/react-query';
import { useStore, type WritableAtom } from 'jotai';
import {
  hitlQueueAtom,
  hitlActionErrorAtom,
  restoreHitlItemAtom,
  approveHitlItemAtom,
  rejectHitlItemAtom,
  requestReReviewHitlItemAtom,
  startReviewHitlItemAtom,
  type HitlQueueItem,
} from '@/features/queue/store/queueAtoms';
import {
  approveHitlItem,
  rejectHitlItem,
  requestReReviewHitlItem,
  startReviewHitlItem,
  type HitlQueueActionType,
} from '@/features/queue/api/hitlQueueService';

interface HitlQueueActionVariables {
  type: HitlQueueActionType;
  id: string;
}

interface HitlQueueActionContext {
  previousItem: HitlQueueItem | undefined;
}

// 액션별 낙관적 업데이트 atom과 서비스 함수를 한곳에서 관리
const HITL_ACTION_MAP: Record<
  HitlQueueActionType,
  { optimisticAtom: WritableAtom<null, [string], void>; request: (id: string) => Promise<void> }
> = {
  startReview: { optimisticAtom: startReviewHitlItemAtom, request: startReviewHitlItem },
  approve: { optimisticAtom: approveHitlItemAtom, request: approveHitlItem },
  reject: { optimisticAtom: rejectHitlItemAtom, request: rejectHitlItem },
  reReview: { optimisticAtom: requestReReviewHitlItemAtom, request: requestReReviewHitlItem },
};

// HITL 큐 승인/반려/재검토/검토시작 액션 공용 훅
// 낙관적 Jotai 업데이트 후 axios 서비스 호출
// 실패 시 이전 상태로 롤백 + 에러 토스트 표시
export function useHitlQueueAction() {
  const store = useStore();

  const mutation = useMutation<void, Error, HitlQueueActionVariables, HitlQueueActionContext>({
    mutationKey: ['hitlQueueAction'],
    mutationFn: ({ type, id }) => HITL_ACTION_MAP[type].request(id),
    onMutate: ({ type, id }) => {
      const previousItem = store.get(hitlQueueAtom).find((item) => item.id === id);
      store.set(HITL_ACTION_MAP[type].optimisticAtom, id);
      return { previousItem };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItem) store.set(restoreHitlItemAtom, context.previousItem);
      store.set(hitlActionErrorAtom, '❌ 서버 오류로 실패했습니다. 다시 시도해 주세요.');
    },
  });

  const runAction = (type: HitlQueueActionType, id: string) => {
    if (mutation.isPending) return; // 중복 클릭 방지
    mutation.mutate({ type, id });
  };

  return { runAction, isLoading: mutation.isPending };
}
