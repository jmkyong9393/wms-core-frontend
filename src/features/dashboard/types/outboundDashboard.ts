import type { OutboundOrderStatus } from '@/features/orders/types/order';

// 현재 백엔드에서는 항상 B2B_ORDER만 반환됨 
export type OutboundOrderType = 'B2B_ORDER';

export interface OutboundDashboardOrder {
  id: string;
  customer_name: string | null;
  order_type: OutboundOrderType;
  total_price: number;
  status: OutboundOrderStatus;
  waybill_number: string | null;
  created_at: string;
  shipped_at: string | null;
}

// GET /api/v1/admin/dashboard/outbound-summary 응답
export interface OutboundDashboardSummary {
  active_picking_order_count: number;
  picking_completion_rate: number;
  today_shipping_label_issued_count: number;
  recent_orders: OutboundDashboardOrder[];
}
