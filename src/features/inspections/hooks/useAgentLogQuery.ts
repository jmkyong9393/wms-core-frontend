'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getAgentLog } from '@/features/inspections/api/agentLogService';
import { agentLogKeys } from '@/features/inspections/constants/queryKeys';

// 검수 건의 Agent 실행 로그 조회 (Suspense)
export function useAgentLogQuery(inspectionId: string) {
  return useSuspenseQuery({
    queryKey: agentLogKeys.detail(inspectionId),
    queryFn: () => getAgentLog(inspectionId),
  });
}
