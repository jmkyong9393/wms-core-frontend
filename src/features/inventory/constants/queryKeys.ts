import type { InventoryListParams } from '@/features/inventory/types/inventoryRow';

// 재고 목록 Query key factory
export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (params: InventoryListParams) => [...inventoryKeys.all, 'list', params] as const,
  detail: (inventoryId: string) => [...inventoryKeys.all, 'detail', inventoryId] as const,
};
