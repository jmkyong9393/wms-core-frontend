'use client';

import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/features/orders/api/orderService';
import { orderKeys } from '@/features/orders/constants/queryKeys';
import type { OrderListParams } from '@/features/orders/types/order';

// 출고 주문 목록 조회 (기본값: PENDING 상태만)
// 현재 진행 가능한 작업을 그대로 보여주는 화면이라 전역 staleTime 캐시를 믿지 않고
// 화면 진입(mount)마다 항상 최신 상태를 다시 조회한다.
export function useOrderListQuery(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => listOrders(params),
    refetchOnMount: 'always',
  });
}
