import type { PaginationParams } from '@/types/pagination';

// 재고 목록 Query key factory
export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (params: PaginationParams) => [...inventoryKeys.all, 'list', params] as const,
};
