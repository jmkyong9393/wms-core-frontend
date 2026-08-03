import type { BookGrade } from '@/features/inspections/types/inspection';
import type { InspectionJobStatus } from '@/types/returnTypes';

// LPN 상세 화면에서 사용하는 입고 유형
export type LpnInboundType = 'NEW_STOCK' | 'USED_PURCHASE' | 'CUSTOMER_RETURN';

export type LpnInboundStatus = 'RECEIVED' | 'CHECKING' | 'COMPLETED';

export type UsedInventoryStatus = 'AVAILABLE' | 'RESERVED' | 'SHIPPED';

export type RejectedItemStatus = 'REJECT_HOLD' | 'DISCARDED';

export interface LpnScanBook {
  id: string;
  isbn: string;
  title: string;
  publisher: string | null;
}

export interface LpnScanLocation {
  id: string;
  barcode: string;
  zone: string;
  rack: string;
  shelf: string;
}

// 직원용 LPN 스캔 상세 정보
export interface LpnScanDetail {
  lpnBarcode: string;
  book: LpnScanBook;
  inboundType: LpnInboundType;
  inboundStatus: LpnInboundStatus;
  inspectionStatus: InspectionJobStatus | null;
  finalGrade: BookGrade | null;
  ubciScore: number | null;
  inventoryStatus: UsedInventoryStatus | null;
  rejectedItemStatus: RejectedItemStatus | null;
  location: LpnScanLocation | null;
  requiresRetake: boolean;
}
