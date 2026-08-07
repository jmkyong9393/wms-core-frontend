export type InboundType =
  | 'NEW_STOCK'
  | 'USED_PURCHASE'
  | 'CUSTOMER_RETURN';

export type InboundStatus =
  | 'RECEIVED'
  | 'CHECKING'
  | 'COMPLETED';

export type ConditionGrade =
  | 'MINT'
  | 'EXCELLENT'
  | 'NORMAL'
  | 'REJECT';

export interface InboundDashboardTrendItem {
  date: string;
  new_stock_quantity: number;
  used_return_quantity: number;
}

export interface InboundDashboardGradeItem {
  grade: ConditionGrade;
  quantity: number;
}

export interface InboundDashboardZoneItem {
  zone: string;
  new_stock_quantity: number;
  used_stock_quantity: number;
  available_quantity: number;
}

export interface RecentInboundActivity {
  inbound_item_id: string;
  book_title: string;
  inbound_type: InboundType;
  inbound_status: InboundStatus;
  quantity: number;
  location_barcode: string | null;
  occurred_at: string;
}

export interface InboundDashboardSummary {
  today_inbound_quantity: number;
  completed_inspection_count: number;
  pending_inspection_count: number;
  recheck_required_count: number;
  daily_inbound_trend: InboundDashboardTrendItem[];
  grade_distribution: InboundDashboardGradeItem[];
  zone_stocks: InboundDashboardZoneItem[];
  recent_activities: RecentInboundActivity[];
}