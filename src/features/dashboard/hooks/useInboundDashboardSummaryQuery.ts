'use client';

import { useQuery } from '@tanstack/react-query';
import { getInboundDashboardSummary } from '@/features/dashboard/api/inboundDashboardService';
import { dashboardKeys } from '@/features/dashboard/constants/queryKeys';

export function useInboundDashboardSummaryQuery(days = 7) {
  return useQuery({
    queryKey: dashboardKeys.inboundSummary(days),
    queryFn: () => getInboundDashboardSummary(days),
    refetchInterval: 30_000,
  });
}