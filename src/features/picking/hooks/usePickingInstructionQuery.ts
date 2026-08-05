'use client';

import { useQuery } from '@tanstack/react-query';
import { getPickingInstruction } from '@/features/picking/api/pickingService';
import { pickingKeys } from '@/features/picking/constants/queryKeys';

// 주문 하나에 대한 피킹 지시서/진행 상태 조회
export function usePickingInstructionQuery(orderId: string) {
  return useQuery({
    queryKey: pickingKeys.detail(orderId),
    queryFn: () => getPickingInstruction(orderId),
  });
}
