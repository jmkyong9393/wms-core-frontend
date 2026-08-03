import type { InspectionJobStatus } from '@/types/returnTypes';
import type {
  LpnInboundStatus,
  LpnInboundType,
  RejectedItemStatus,
  UsedInventoryStatus,
} from '@/features/lpnScan/types/lpnScan';

export const INBOUND_TYPE_LABEL_KO: Record<LpnInboundType, string> = {
  NEW_STOCK: '신규 매입',
  USED_PURCHASE: '중고 매입',
  CUSTOMER_RETURN: '고객 반품',
};

export const INBOUND_STATUS_LABEL_KO: Record<LpnInboundStatus, string> = {
  RECEIVED: '입고 접수',
  CHECKING: '검수 진행중',
  COMPLETED: '입고 완료',
};

export const INSPECTION_STATUS_LABEL_KO: Record<InspectionJobStatus, string> = {
  PENDING: '검수 대기중',
  PROCESSING: 'AI 분석중',
  HITL_REQUIRED: '관리자 판정 대기',
  RECHECK_REQUIRED: '재촬영 필요',
  APPROVED: '검수 승인',
  REJECTED: '검수 반려',
  FAILED: '검수 처리 실패',
};

export const INVENTORY_STATUS_LABEL_KO: Record<UsedInventoryStatus, string> = {
  AVAILABLE: '판매 가능',
  RESERVED: '주문 할당',
  SHIPPED: '출고 완료',
};

export const REJECTED_ITEM_STATUS_LABEL_KO: Record<RejectedItemStatus, string> = {
  REJECT_HOLD: '반려 보류',
  DISCARDED: '폐기',
};
