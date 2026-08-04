import type { OutboundOrderStatus } from '@/features/orders/types/order';

// 출고 주문 상태 한글 라벨 (주문 목록/피킹/출고 대시보드 공통)
export const ORDER_STATUS_LABEL: Record<OutboundOrderStatus, string> = {
  PENDING: '대기 중',
  PICKING: '피킹 중',
  SHIPPED: '출고 완료',
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status as OutboundOrderStatus] ?? status;
}
