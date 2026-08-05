import type { RestockAlertPayload, RestockAlertPayloadWire } from '@/features/notifications/types/notification';

// 백엔드 알림 데이터를 프론트 형식으로 변환
export function normalizeRestockAlertPayload(wire: RestockAlertPayloadWire): RestockAlertPayload {
  return {
    orderProposalId: wire.order_proposal_id,
    returnJobId: wire.return_job_id,
    bookId: wire.book_id,
    proposalSource: wire.proposal_source,
    recommendedOrderQuantity: wire.recommended_order_quantity,
    riskLevel: wire.risk_level,
  };
}
