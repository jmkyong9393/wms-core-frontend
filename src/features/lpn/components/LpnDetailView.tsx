'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useLpnDetailQuery } from '@/features/lpn/hooks/useLpnDetailQuery';
import { useRecalculateLpnPricingMutation } from '@/features/lpn/hooks/useRecalculateLpnPricingMutation';
import { getLpnErrorMessage } from '@/features/lpn/utils/lpnErrorMessage';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LpnDetailViewProps {
  lpnBarcode: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// LPN 단품 재고 상세 (동적 가격 정보 + 수동 재산정)
export function LpnDetailView({ lpnBarcode }: LpnDetailViewProps) {
  const router = useRouter();
  const { data: lpn, isLoading, isError, error } = useLpnDetailQuery(lpnBarcode);
  const recalculateMutation = useRecalculateLpnPricingMutation(lpnBarcode);

  // AVAILABLE 상태의 판매 가능 LPN만 재산정 가능 (백엔드 409 조건과 동일)
  const canRecalculate = lpn?.inventory_status === 'AVAILABLE';

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => router.push('/admin/inventory')}
        className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="w-4 h-4" />
        재고 관리로 돌아가기
      </button>

      {isLoading && <p className="text-sm text-gray-400">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600">{getLpnErrorMessage(error)}</p>}

      {lpn && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{lpn.book.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{lpn.book.publisher ?? '출판사 미확인'}</p>
              <p className="text-xs font-mono text-gray-500 mt-0.5">LPN {lpn.lpn_barcode}</p>
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

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">가격 정보</span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', getPricingStatusBadgeStyle(lpn.pricing_status))}>
                {getPricingStatusLabel(lpn.pricing_status)}
              </span>
            </div>
            <InfoRow label="정가" value={formatCurrencyKRW(lpn.base_price)} />
            <InfoRow label="할인율" value={lpn.discount_rate == null ? '-' : formatDiscountRate(lpn.discount_rate)} />
            <InfoRow label="판매가" value={lpn.sale_price == null ? '-' : formatCurrencyKRW(lpn.sale_price)} />
          </div>

          {recalculateMutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {getLpnErrorMessage(recalculateMutation.error)}
            </p>
          )}
          {recalculateMutation.isSuccess && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {recalculateMutation.data.pricing_changed
                ? '가격이 새로 산정되어 갱신되었습니다.'
                : '재산정 결과가 기존 가격과 동일합니다.'}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={!canRecalculate || recalculateMutation.isPending}
            onClick={() => recalculateMutation.mutate()}
          >
            <RefreshCw className={cn('w-4 h-4 mr-1.5', recalculateMutation.isPending && 'animate-spin')} />
            {recalculateMutation.isPending ? '재산정 중...' : '가격 수동 재산정'}
          </Button>
          {!canRecalculate && (
            <p className="text-xs text-gray-400 text-center">
              AVAILABLE 상태의 판매 가능 LPN만 재산정할 수 있습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
