'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
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
    onError: (error, orderId) => {
      // 이미 PICKING으로 전환된 주문에 재요청한 경우 - 상세 조회 및 주문 목록을 최신 상태로 갱신
      if (isAxiosError(error) && error.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: pickingKeys.detail(orderId) });
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
      }
    },
  });
}
