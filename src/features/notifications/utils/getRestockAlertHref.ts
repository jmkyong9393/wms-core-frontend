// RESTOCK_ALERT 알림에서 해당 발주 추천안 상세로 바로 이동할 수 있는 경로 생성
export function getRestockAlertHref(orderProposalId: string): string {
  return `/admin/restock?proposalId=${encodeURIComponent(orderProposalId)}`;
}
