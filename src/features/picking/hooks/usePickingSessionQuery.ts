'use client';

import { useQuery } from '@tanstack/react-query';
import { getPickingSession } from '@/features/picking/api/pickingService';
import { pickingKeys } from '@/features/picking/constants/queryKeys';

// 주문 하나에 대한 피킹 세션 조회
export function usePickingSessionQuery(orderId: string) {
  return useQuery({
    queryKey: pickingKeys.session(orderId),
    queryFn: () => getPickingSession(orderId),
  });
}
