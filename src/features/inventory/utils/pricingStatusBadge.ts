import type { PricingStatus } from '@/features/inventory/types/inventoryRow';

// 가격 산정 상태별 라벨/배지 스타일 (신간 목록·상세, 중고 LPN 상세 공통)
const PRICING_STATUS_LABEL: Record<PricingStatus, string> = {
  DEFAULT_POLICY: '기본 정책가',
  AGENT_PRICED: 'AI 산정 완료',
  PENDING: '가격 미확정',
};

const PRICING_STATUS_BADGE_STYLE: Record<PricingStatus, string> = {
  DEFAULT_POLICY: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  AGENT_PRICED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PENDING: 'bg-gray-200 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300',
};

export function getPricingStatusLabel(status: string): string {
  return PRICING_STATUS_LABEL[status as PricingStatus] ?? status;
}

export function getPricingStatusBadgeStyle(status: string): string {
  return PRICING_STATUS_BADGE_STYLE[status as PricingStatus] ?? 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300';
}
