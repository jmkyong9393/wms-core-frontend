'use client';

import { useQuery } from '@tanstack/react-query';
import { listInventory } from '@/features/inventory/api/inventoryService';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';

// 재고 목록 데이터 조회
// 필터와 정렬은 화면에서 처리
export function useInventoryQuery() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: listInventory,
  });
}
