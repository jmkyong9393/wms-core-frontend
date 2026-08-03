import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { AgentLogStep } from '@/features/inspections/types/inspection';

// 검수 건의 Agent 실행 로그 조회
export async function getAgentLog(inspectionId: string): Promise<AgentLogStep[]> {
  const record = mockInspectionRecords.find(r => r.id === inspectionId);
  return record?.steps || [];
}
