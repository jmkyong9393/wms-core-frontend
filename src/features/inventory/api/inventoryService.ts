import { apiClient } from '@/lib/api-client';
import { INVENTORY_LIST_ENDPOINT } from '@/features/inventory/constants/inventoryApi';
import type { InventoryRow } from '@/features/inventory/types/inventoryRow';

// 재고 통합 조회 (신간 묶음 재고 + 중고/반품 단품 재고)
export async function listInventory(): Promise<InventoryRow[]> {
  const res = await apiClient.get<InventoryRow[]>(INVENTORY_LIST_ENDPOINT);
  return res.data;
}
