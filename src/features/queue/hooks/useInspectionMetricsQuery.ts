'use client';

import { useQuery } from '@tanstack/react-query';
import { getInspectionMetrics } from '@/services/dashboardService';

// HITL 처리 현황 KPI 카드용 검수 집계 조회 (전체 ReturnJob 기준, 페이지네이션과 무관)
export function useInspectionMetricsQuery() {
  return useQuery({
    queryKey: ['inspectionMetrics'],
    queryFn: getInspectionMetrics,
  });
}
