'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useLpnDetailQuery } from '@/features/lpn/hooks/useLpnDetailQuery';
import { getLpnErrorMessage } from '@/features/lpn/utils/lpnErrorMessage';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface LpnDetailViewProps {
  lpnBarcode: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// LPN 단품 재고 상세 (동적 가격 정보 조회)
export function LpnDetailView({ lpnBarcode }: LpnDetailViewProps) {
  const router = useRouter();
  const { data: lpn, isLoading, isError, error } = useLpnDetailQuery(lpnBarcode);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => router.push('/admin/inventory')}
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        재고 관리로 돌아가기
      </button>

      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">{getLpnErrorMessage(error)}</p>}

      {lpn && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{lpn.book.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{lpn.book.publisher ?? '출판사 미확인'}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">LPN {lpn.lpn_barcode}</p>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', getInventoryGradeBadgeStyle(lpn.condition_grade))}>
              {getInventoryGradeLabel(lpn.condition_grade)}
            </span>
          </div>

          <div>
            <InfoRow label="상태" value={lpn.inventory_status} />
            <InfoRow label="UBCI 점수" value={lpn.ubci_score ?? '-'} />
            <InfoRow label="보관 위치" value={lpn.location.barcode ?? `${lpn.location.zone}-${lpn.location.rack}-${lpn.location.shelf}`} />
            <InfoRow label="재고 편입일" value={lpn.stocked_at.slice(0, 10)} />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">가격 정보</span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', getPricingStatusBadgeStyle(lpn.pricing_status))}>
                {getPricingStatusLabel(lpn.pricing_status)}
              </span>
            </div>
            <InfoRow label="정가" value={formatCurrencyKRW(lpn.base_price)} />
            <InfoRow label="할인율" value={lpn.discount_rate == null ? '-' : formatDiscountRate(lpn.discount_rate)} />
            <InfoRow label="판매가" value={lpn.sale_price == null ? '-' : formatCurrencyKRW(lpn.sale_price)} />
          </div>
        </div>
      )}
    </div>
  );
}
