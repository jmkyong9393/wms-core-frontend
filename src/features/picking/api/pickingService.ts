import { apiClient } from '@/lib/api-client';
import {
  PICKING_INSTRUCTIONS_ENDPOINT,
  pickingConfirmEndpoint,
  pickingInstructionDetailEndpoint,
  pickingScanEndpoint,
} from '@/features/picking/constants/pickingApi';
import type {
  PickResponse,
  PickingInstructionDetailResponse,
  PickingScanRequest,
  PickingScanResponse,
  ShipmentConfirmResponse,
} from '@/features/picking/types/picking';

// 피킹 지시서 생성 (PENDING 주문에서 단 1회만 호출 - 재호출 시 409)
export async function createPickingInstruction(orderId: string): Promise<PickResponse> {
  const res = await apiClient.post<PickResponse>(PICKING_INSTRUCTIONS_ENDPOINT, { order_id: orderId });
  return res.data;
}

// 피킹 지시서/진행 상태 조회 (PICKING·SHIPPED 상태에서만 동작)
export async function getPickingInstruction(orderId: string): Promise<PickingInstructionDetailResponse> {
  const res = await apiClient.get<PickingInstructionDetailResponse>(pickingInstructionDetailEndpoint(orderId));
  return res.data;
}

// 바코드 스캔으로 예약 항목 검증
export async function scanPickingAllocation(
  orderId: string,
  payload: PickingScanRequest
): Promise<PickingScanResponse> {
  const res = await apiClient.post<PickingScanResponse>(pickingScanEndpoint(orderId), payload);
  return res.data;
}

// 출고 확정 (전 항목 스캔 완료 시에만 성공, SHIPPED 이후 재호출은 멱등)
export async function confirmShipment(orderId: string): Promise<ShipmentConfirmResponse> {
  const res = await apiClient.post<ShipmentConfirmResponse>(pickingConfirmEndpoint(orderId));
  return res.data;
}
