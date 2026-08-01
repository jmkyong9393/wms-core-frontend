'use client';

import { useQuery } from '@tanstack/react-query';
import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import { inspectionHistoryKeys } from '@/features/inspections/constants/queryKeys';
import type { InspectionHistoryListParams } from '@/features/inspections/types/inspectionHistory';

// 검색 및 필터 조건에 맞는 검수 이력 목록 조회
export function useInspectionHistoryQuery(params: InspectionHistoryListParams) {
  return useQuery({
    queryKey: inspectionHistoryKeys.list(params),
    queryFn: () => listInspectionHistory(params),
  });
}
