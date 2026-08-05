'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPickingInstruction } from '@/features/picking/api/pickingService';
import { pickingKeys } from '@/features/picking/constants/queryKeys';
import { orderKeys } from '@/features/orders/constants/queryKeys';

// 피킹 지시서 생성  진행
export function useCreatePickingInstructionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => createPickingInstruction(orderId),
    onSuccess: (data) => {
      queryClient.setQueryData(pickingKeys.detail(data.order_id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (_error, orderId) => {
      // 실패 원인(409뿐 아니라 네트워크 오류 등)과 무관하게 최신 상태를 다시 조회해
      // 실제로는 반영됐지만 클라이언트만 실패로 인식하는 경우를 재조회로 보정한다.
      queryClient.invalidateQueries({ queryKey: pickingKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
