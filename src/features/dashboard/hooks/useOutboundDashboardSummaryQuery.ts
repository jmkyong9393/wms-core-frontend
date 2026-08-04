'use client';

import { useQuery } from '@tanstack/react-query';
import { getOutboundDashboardSummary } from '@/features/dashboard/api/outboundDashboardService';
import { dashboardKeys } from '@/features/dashboard/constants/queryKeys';

// 출고 관리자 대시보드 요약 조회 
export function useOutboundDashboardSummaryQuery() {
  return useQuery({
    queryKey: dashboardKeys.outboundSummary,
    queryFn: getOutboundDashboardSummary,
    refetchInterval: 30_000,
  });
}
