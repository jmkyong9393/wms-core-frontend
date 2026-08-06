export interface InspectionMetrics {
  total_jobs: number;
  pending_jobs: number;
  processing_jobs: number;
  approved_jobs: number;
  rejected_jobs: number;
  failed_jobs: number;
  hitl_required_jobs: number;
  recheck_required_jobs: number;
  average_processing_time_seconds: number;
}

export interface WeeklyInsight {
  id: string;
  report_week: string;
  saved_labor_cost_krw: number;
  top_defective_publishers: Record<string, number> | null;
  location_hotspots: Record<string, number> | null;
  logistics_hotspots: Record<string, number> | null;
  predicted_returns: number;
  created_at: string;
  updated_at: string;
}

export interface FdsReport {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer_name?: string; // 화면 표시용 고객 이름 (시뮬레이션/조회용)
  fraud_score: number;
  fraud_reason: string | null;
  detected_at: string;
  created_at: string;
  updated_at: string;
}

export interface FdsPolicy {
  policy_key: string;
  policy_value: number;
  description: string | null;
  updated_at: string;
}

export interface FlowTrendItem {
  date: string;
  inbound_quantity: number;
  outbound_quantity: number;
  average_inspection_processing_seconds: number;
}

export interface FlowTrendResponse {
  days: number;
  items: FlowTrendItem[];
}

export interface ChartTrendItem {
  date: string;
  입고건수: number;
  출고건수: number;
  평균시간: number;
}
