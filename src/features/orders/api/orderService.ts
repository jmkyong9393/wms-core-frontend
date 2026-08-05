import { apiClient } from '@/lib/api-client';
import { ORDER_LIST_ENDPOINT } from '@/features/orders/constants/orderApi';
import type { OrderListParams, OrderListResponse } from '@/features/orders/types/order';

// 출고 주문 목록 조회 (기본값: PENDING 상태만)
export async function listOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
  const { status = 'PENDING', page = 1, size = 20 } = params;
  const res = await apiClient.get<OrderListResponse>(ORDER_LIST_ENDPOINT, {
    params: { status, page, size },
  });
  return res.data;
}
