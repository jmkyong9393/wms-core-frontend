// 피킹 세션 Query key factory
export const pickingKeys = {
  all: ['picking'] as const,
  session: (orderId: string) => [...pickingKeys.all, 'session', orderId] as const,
};
