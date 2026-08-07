import type {
  RestockProposalSource,
  RestockProposalStatus,
  RiskLevel,
} from '@/features/restock/types/restockProposal';

export const STATUS_BADGE_STYLE: Record<RestockProposalStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  APPROVED: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900',
  NOT_REQUIRED: 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
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
  HIGH: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900',
  LOW: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
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

export const PROPOSAL_SOURCE_BADGE_STYLE: Record<RestockProposalSource, string> = {
  RETURN_REJECTION: 'bg-ai-muted text-ai border border-ai-border',
  SAFETY_STOCK: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900',
};

export const PROPOSAL_SOURCE_LABEL_KO: Record<RestockProposalSource, string> = {
  RETURN_REJECTION: '반려 대체 발주',
  SAFETY_STOCK: '안전재고 부족',
};

export function getProposalSourceBadgeStyle(proposalSource: RestockProposalSource): string {
  return PROPOSAL_SOURCE_BADGE_STYLE[proposalSource];
}

export function getProposalSourceLabel(proposalSource: RestockProposalSource): string {
  return PROPOSAL_SOURCE_LABEL_KO[proposalSource];
}
