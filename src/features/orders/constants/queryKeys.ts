import type { OrderListParams } from '@/features/orders/types/order';

// 출고 주문 목록 Query key factory
export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderListParams = {}) => [...orderKeys.all, 'list', params] as const,
};
