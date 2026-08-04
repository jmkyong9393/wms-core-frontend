'use client';

import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/features/orders/api/orderService';
import { orderKeys } from '@/features/orders/constants/queryKeys';
import type { OrderListParams } from '@/features/orders/types/order';

// 출고 주문 목록 조회 (기본값: PENDING 상태만)
export function useOrderListQuery(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => listOrders(params),
  });
}
