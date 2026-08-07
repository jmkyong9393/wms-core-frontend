import { apiClient } from '@/lib/api-client';
import { INBOUND_DASHBOARD_SUMMARY_ENDPOINT } from '@/features/dashboard/constants/inboundDashboardApi';
import type { InboundDashboardSummary } from '@/features/dashboard/types/inboundDashboard';

export async function getInboundDashboardSummary(
  days = 7,
): Promise<InboundDashboardSummary> {
  const res = await apiClient.get<InboundDashboardSummary>(
    INBOUND_DASHBOARD_SUMMARY_ENDPOINT,
    {
      params: { days },
    },
  );

  return res.data;
}