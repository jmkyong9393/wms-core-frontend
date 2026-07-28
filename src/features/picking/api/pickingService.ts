import { apiClient } from '@/lib/api-client';
import { PICKING_LIST_ENDPOINT } from '@/features/picking/constants/pickingApi';
import type { PickingSession } from '@/features/picking/types/picking';

// 주문 하나에 대한 피킹 지시서 조회
export async function getPickingSession(orderId: string): Promise<PickingSession> {
  const res = await apiClient.get<PickingSession>(PICKING_LIST_ENDPOINT(orderId));
  return res.data;
}
