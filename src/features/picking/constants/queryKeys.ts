// 피킹 지시서 Query key factory
export const pickingKeys = {
  all: ['picking'] as const,
  detail: (orderId: string) => [...pickingKeys.all, 'detail', orderId] as const,
};
