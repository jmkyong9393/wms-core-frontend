'use client';

import { useQuery } from '@tanstack/react-query';
import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import { inspectionHistoryKeys } from '@/features/inspections/constants/queryKeys';

// 검수 이력 목록 조회
export function useInspectionHistoryQuery() {
  return useQuery({
    queryKey: inspectionHistoryKeys.all,
    queryFn: listInspectionHistory,
  });
}
