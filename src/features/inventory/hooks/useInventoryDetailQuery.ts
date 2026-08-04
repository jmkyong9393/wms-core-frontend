'use client';

import { useQuery } from '@tanstack/react-query';
import { getInventoryDetail } from '@/features/inventory/api/inventoryService';
import { inventoryKeys } from '@/features/inventory/constants/queryKeys';

// 신간 묶음 재고 단건 상세 조회
export function useInventoryDetailQuery(inventoryId: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(inventoryId),
    queryFn: () => getInventoryDetail(inventoryId),
  });
}
