import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';
import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { AgentLogStep } from '@/features/inspections/types/inspection';

/**
 * 검수 Agent 로그 Mock
 *
 * 백엔드에 아직 없는 Agent 로그 조회 API를 대신해
 * 기존 mockInspectionRecords의 steps를 반환
 */
export const inspectionHandlers = [
  // 검수 건의 Agent 실행 로그 조회
  http.get(`${API_BASE_URL}/api/v1/inspections/:inspectionId/agent-logs`, ({ params }) => {
    const { inspectionId } = params;
    const record = mockInspectionRecords.find((r) => r.id === inspectionId);
    if (!record) {
      return HttpResponse.json({ detail: '검수 건을 찾을 수 없습니다.' }, { status: 404 });
    }

    const response: AgentLogStep[] = record.steps;
    return HttpResponse.json(response);
  }),
];
