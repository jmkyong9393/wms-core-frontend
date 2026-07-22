// 재고 목록 Query key factory
export const inventoryKeys = {
  all: ['inventory'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
};
