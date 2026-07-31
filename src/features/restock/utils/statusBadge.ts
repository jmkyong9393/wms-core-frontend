import type { RestockProposalStatus, RiskLevel } from '@/features/restock/types/restockProposal';

export const STATUS_BADGE_STYLE: Record<RestockProposalStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  NOT_REQUIRED: 'bg-slate-100 text-slate-500',
};

export const STATUS_LABEL_KO: Record<RestockProposalStatus, string> = {
  PENDING: '검토 대기',
  APPROVED: '승인 완료',
  REJECTED: '반려됨',
  NOT_REQUIRED: '발주 불필요',
};

export function getRestockStatusBadgeStyle(status: RestockProposalStatus): string {
  return STATUS_BADGE_STYLE[status];
}

export function getRestockStatusLabel(status: RestockProposalStatus): string {
  return STATUS_LABEL_KO[status];
}

export const RISK_BADGE_STYLE: Record<RiskLevel, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-600',
};

export const RISK_LABEL_KO: Record<RiskLevel, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

export function getRiskBadgeStyle(riskLevel: RiskLevel): string {
  return RISK_BADGE_STYLE[riskLevel];
}

export function getRiskLabel(riskLevel: RiskLevel): string {
  return RISK_LABEL_KO[riskLevel];
}
