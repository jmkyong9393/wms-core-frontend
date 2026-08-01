import type { InspectionHistoryListParams } from '@/features/inspections/types/inspectionHistory';

// 검수 이력 Query key factory
export const inspectionHistoryKeys = {
  all: ['inspectionHistory'] as const,
  list: (params: InspectionHistoryListParams) => [...inspectionHistoryKeys.all, 'list', params] as const,
};

// 검수 Agent 로그 Query key factory
export const agentLogKeys = {
  detail: (inspectionId: string) => ['agentLog', inspectionId] as const,
};
