'use client';

import { useQuery } from '@tanstack/react-query';
import { listInventory } from '@/features/inventory/api/inventoryService';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';
import type { PaginationParams } from '@/types/pagination';

// 페이지 조건에 맞는 재고 목록 조회
export function useInventoryQuery(params: PaginationParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => listInventory(params),
  });
}
