import type { InspectionStatus } from '../types/inspection';

// 검수 상태별 배지 색상
export const STATUS_BADGE_STYLE: Record<InspectionStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  PROCESSING: 'bg-blue-100 text-blue-700',
  HITL_REQUIRED: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
};

const DEFAULT_STATUS_BADGE_STYLE = 'bg-gray-100 text-gray-600';

export function getStatusBadgeStyle(status: string): string {
  return STATUS_BADGE_STYLE[status as InspectionStatus] ?? DEFAULT_STATUS_BADGE_STYLE;
}

// 검수 상태별 화면 표시 라벨
export const STATUS_LABEL_KO: Record<InspectionStatus, string> = {
  PENDING: '대기중',
  PROCESSING: '처리중',
  HITL_REQUIRED: '관리자 검토 대기',
  APPROVED: '승인완료',
  REJECTED: '반려',
  FAILED: '처리실패',
};

const UNKNOWN_STATUS_LABEL = '알 수 없음';

export function getStatusLabel(status: string): string {
  return STATUS_LABEL_KO[status as InspectionStatus] ?? UNKNOWN_STATUS_LABEL;
}
