import { apiClient } from '@/lib/api-client';
import { adminInspectionAgentLogsEndpoint } from '@/features/inspections/constants/inspectionApi';
import type { AgentLogStep } from '@/features/inspections/types/inspection';

// 검수 건의 Agent 실행 로그 조회
export async function getAgentLog(inspectionId: string): Promise<AgentLogStep[]> {
  const isMockMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('wms_mock_mode') === 'true';
  };

  // Mock 모드이거나 정적 mock ID일 경우 로컬 mock 데이터 반환
  if (isMockMode() || inspectionId.startsWith('insp_')) {
    const { mockInspectionRecords } = await import('@/features/inspections/mocks/mockAgentLogs');
    const record = mockInspectionRecords.find(r => r.id === inspectionId);
    return record?.steps || [];
  }

  // 실제 백엔드 API 연동 (관리자 권한 필요 - 메인의 endpoint 헬퍼 활용)
  const res = await apiClient.get<AgentLogStep[]>(adminInspectionAgentLogsEndpoint(inspectionId));
  return res.data;
}
