import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api-client';
import { ADMIN_INSPECTIONS_ENDPOINT } from '@/features/inspections/constants/inspectionApi';
import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { AgentLogStep } from '@/features/inspections/types/inspection';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import type { PaginatedResponse } from '@/types/pagination';

/**
 * 검수 Agent 로그 / 검수 이력 Mock
 *
 * 백엔드에 아직 없는 Agent 로그 조회 API를 대신해
 * 기존 mockInspectionRecords의 steps를 반환
 */
export const inspectionHandlers = [
  // 관리자 검수 이력 조회 (검색/필터/페이지네이션)
  http.get(`${API_BASE_URL}${ADMIN_INSPECTIONS_ENDPOINT}`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
    const grade = url.searchParams.get('grade');
    const startDate = url.searchParams.get('start_date')?.slice(0, 10);
    // 프론트가 종료일 포함을 위해 T23:59:59를 붙여 보내므로 날짜 부분만 비교
    const endDate = url.searchParams.get('end_date')?.slice(0, 10);
    const page = Number(url.searchParams.get('page') ?? '1');
    const size = Number(url.searchParams.get('size') ?? '20');

    const filtered = mockInspectionRecords.filter((record) => {
      const matchesStatus = !status || record.status === status;
      const matchesKeyword = !keyword || record.bookTitle.toLowerCase().includes(keyword);
      const matchesGrade = !grade || record.finalGrade === grade;
      const rowDate = record.inspectedAt.slice(0, 10);
      const matchesStart = !startDate || rowDate >= startDate;
      const matchesEnd = !endDate || rowDate <= endDate;
      return matchesStatus && matchesKeyword && matchesGrade && matchesStart && matchesEnd;
    });

    const start = (page - 1) * size;
    const items: InspectionHistoryRow[] = filtered.slice(start, start + size);

    const response: PaginatedResponse<InspectionHistoryRow> = {
      items,
      total: filtered.length,
      page,
      size,
      total_pages: Math.ceil(filtered.length / size),
    };
    return HttpResponse.json(response);
  }),

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
