'use client';

import { useQuery } from '@tanstack/react-query';
import { listInventory } from '@/features/inventory/api/inventoryService';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';
import type { InventoryListParams } from '@/features/inventory/types/inventoryRow';

// 검색 및 필터 조건에 맞는 재고 목록 조회
export function useInventoryQuery(params: InventoryListParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => listInventory(params),
  });
}
