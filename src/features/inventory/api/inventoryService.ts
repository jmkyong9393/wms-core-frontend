import { apiClient } from '@/lib/api-client';
import { INVENTORY_LIST_ENDPOINT, inventoryDetailEndpoint } from '@/features/inventory/constants/inventoryApi';
import type { InventoryListParams, InventoryRow } from '@/features/inventory/types/inventoryRow';
import type { PaginatedResponse } from '@/types/pagination';

// 재고 통합 조회 (신간 묶음 재고 + 중고/반품 단품 재고)
export async function listInventory(
  params: InventoryListParams
): Promise<PaginatedResponse<InventoryRow>> {
  const res = await apiClient.get<PaginatedResponse<InventoryRow>>(INVENTORY_LIST_ENDPOINT, {
    params,
  });
  return res.data;
}

// 신간 묶음 재고 단건 상세 조회
export async function getInventoryDetail(inventoryId: string): Promise<InventoryRow> {
  const res = await apiClient.get<InventoryRow>(inventoryDetailEndpoint(inventoryId));
  return res.data;
}
