import type { HitlItemStatus } from '@/features/queue/store/queueAtoms';

export const STATUS_LABEL: Record<HitlItemStatus, string> = {
  AWAITING_REVIEW: '검토 대기',
  IN_PROGRESS: '검토중',
  PROCESSING: '처리 중',
  RECHECK_REQUIRED: '재촬영 대기',
  APPROVED: '승인 완료',
  REJECTED: '반려',
};
