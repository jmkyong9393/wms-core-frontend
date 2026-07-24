import { apiClient } from '@/lib/api-client';
import type { AgentLogStep } from '@/features/inspections/types/inspection';

// 검수 건의 Agent 실행 로그 조회
export async function getAgentLog(inspectionId: string): Promise<AgentLogStep[]> {
  const res = await apiClient.get<AgentLogStep[]>(
    `/api/v1/inspections/${inspectionId}/agent-logs`
  );
  return res.data;
}
