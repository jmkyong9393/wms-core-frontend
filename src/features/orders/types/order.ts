// 출고 주문 상태 (백엔드 OrderStatus와 동일)
export type OutboundOrderStatus = 'PENDING' | 'PICKING' | 'SHIPPED';

// GET /api/v1/orders 목록 항목
export interface OrderListItem {
  id: string;
  customer_name: string;
  status: OutboundOrderStatus;
  total_price: number;
  logistics_center: string | null;
  created_at: string;
}

export interface OrderListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface OrderListParams {
  status?: OutboundOrderStatus;
  page?: number;
  size?: number;
}
