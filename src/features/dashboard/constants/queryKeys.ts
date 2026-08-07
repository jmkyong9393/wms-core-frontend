// 대시보드 Query key factory
export const dashboardKeys = {
  outboundSummary: ['dashboard', 'outboundSummary'] as const,
  inboundSummary: (days: number) =>
    ['dashboard', 'inboundSummary', days] as const,
};
