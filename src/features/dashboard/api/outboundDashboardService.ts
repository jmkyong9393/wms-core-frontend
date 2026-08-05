import { apiClient } from '@/lib/api-client';
import { OUTBOUND_DASHBOARD_SUMMARY_ENDPOINT } from '@/features/dashboard/constants/outboundDashboardApi';
import type { OutboundDashboardSummary } from '@/features/dashboard/types/outboundDashboard';

// 출고 관리자 대시보드 요약 조회 (ADMIN/MASTER)
export async function getOutboundDashboardSummary(): Promise<OutboundDashboardSummary> {
  const res = await apiClient.get<OutboundDashboardSummary>(OUTBOUND_DASHBOARD_SUMMARY_ENDPOINT);
  return res.data;
}
