import type { BookGrade } from '@/features/inspections/types/inspection';
import type { OutboundOrderStatus } from '@/features/orders/types/order';

export type AllocationType = 'NEW_STOCK' | 'USED_ITEM';

// 피킹 지시서 내 개별 예약 항목
export interface PickingInstructionItem {
  allocation_type: AllocationType;
  allocation_id: string;
  order_item_id: string;
  book_id: string;
  isbn: string | null;
  quantity: number;
  condition_grade: BookGrade | null;
  // 신품은 단품 LPN 없음
  lpn_barcode: string | null;
  picked_quantity: number;
  is_completed: boolean;
}

export interface PickingShelfGroup {
  shelf: string;
  items: PickingInstructionItem[];
}

export interface PickingRackGroup {
  rack: string;
  shelves: PickingShelfGroup[];
}

export interface PickingZoneGroup {
  zone: string;
  racks: PickingRackGroup[];
}

// POST /api/v1/outbound/picking-instructions 응답
export interface PickResponse {
  order_id: string;
  status: OutboundOrderStatus;
  total_price: number;
  recommended_box: string;
  picking_groups: PickingZoneGroup[];
}

// GET /api/v1/outbound/picking-instructions/{order_id} 응답
export interface PickingInstructionDetailResponse extends PickResponse {
  is_picking_completed: boolean;
}

export interface PickingScanRequest {
  allocation_type: AllocationType;
  allocation_id: string;
  barcode: string;
}

export interface PickingScanResponse {
  order_id: string;
  allocation_type: AllocationType;
  allocation_id: string;
  order_item_id: string;
  expected_quantity: number;
  picked_quantity: number;
  is_completed: boolean;
  message: string;
}

export interface ShippingLabelContact {
  name: string;
  phone: string;
  postal_code: string | null;
  address: string | null;
}

export interface DemoShippingLabel {
  is_demo: boolean;
  title: string;
  collected_date: string;
  sender: ShippingLabelContact;
  recipient: ShippingLabelContact;
}

// POST /api/v1/outbound/picking-instructions/{order_id}/confirm 응답
export interface ShipmentConfirmResponse {
  order_id: string;
  status: OutboundOrderStatus;
  waybill_number: string;
  shipping_carrier: string;
  waybill_barcode: string;
  shipped_at: string;
  shipping_label: DemoShippingLabel;
}

// confirm 409 detail - new/used 배열의 필드 개수가 다르므로 별도 타입 유지
export interface IncompleteNewAllocation {
  allocation_id: string;
  order_item_id: string;
  expected_quantity: number;
  picked_quantity: number;
}

export interface IncompleteUsedAllocation {
  allocation_id: string;
  order_item_id: string;
}

export interface ConfirmShipmentConflictDetail {
  message: string;
  incomplete_new_allocations: IncompleteNewAllocation[];
  incomplete_used_allocations: IncompleteUsedAllocation[];
}
