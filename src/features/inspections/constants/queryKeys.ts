// 검수 이력 Query key factory
export const inspectionHistoryKeys = {
  all: ['inspectionHistory'] as const,
};

// 검수 Agent 로그 Query key factory
export const agentLogKeys = {
  detail: (inspectionId: string) => ['agentLog', inspectionId] as const,
};
