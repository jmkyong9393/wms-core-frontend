// 관리자 검수 이력 조회 API 주소
export const ADMIN_INSPECTIONS_ENDPOINT = '/api/v1/admin/inspections';

// 검수 Agent 단계별 실행 로그 조회 API 주소
export const adminInspectionAgentLogsEndpoint = (jobId: string) =>
  `${ADMIN_INSPECTIONS_ENDPOINT}/${jobId}/agent-logs`;
