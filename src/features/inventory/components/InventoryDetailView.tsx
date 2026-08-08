'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useInventoryDetailQuery } from '@/features/inventory/hooks/useInventoryDetailQuery';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import { formatKstDate } from '@/lib/date';
import { cn } from '@/lib/utils';

interface InventoryDetailViewProps {
  inventoryId: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// 신간 묶음 재고 단건 상세 (정가/할인율/판매가/가격 상태 포함)
export function InventoryDetailView({ inventoryId }: InventoryDetailViewProps) {
  const router = useRouter();
  const { data: inventory, isLoading, isError } = useInventoryDetailQuery(inventoryId);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => router.push('/admin/inventory')}
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        재고 목록으로 돌아가기
      </button>

      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">재고 상세 정보를 불러오지 못했습니다.</p>}

      {inventory && (
        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            {inventory.book.cover_image_url ? (
              <img
                src={inventory.book.cover_image_url}
                alt={`${inventory.book.title} 표지`}
                className="h-40 w-28 shrink-0 rounded-lg border border-border bg-muted object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-semibold text-muted-foreground">
                BOOK
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="line-clamp-2 text-lg font-bold text-foreground">
                    {inventory.book.title}
                  </h2>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    ISBN {inventory.book.isbn ?? '-'}
                  </p>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                    getInventoryGradeBadgeStyle(inventory.grade),
                  )}
                >
                  {getInventoryGradeLabel(inventory.grade)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <InfoRow label="보관 위치" value={inventory.zone} />
            <InfoRow label="재고 수량" value={`${inventory.quantity}권`} />
            <InfoRow label="예약 수량" value={`${inventory.reserved_quantity}권`} />
            <InfoRow label="출고 가능 수량" value={`${inventory.available_quantity}권`} />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">가격 정보</span>
              <span
                className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', getPricingStatusBadgeStyle(inventory.pricing_status))}
              >
                {getPricingStatusLabel(inventory.pricing_status)}
              </span>
            </div>
            <InfoRow label="정가" value={formatCurrencyKRW(inventory.base_price)} />
            <InfoRow
              label="할인율"
              value={inventory.discount_rate == null ? '-' : formatDiscountRate(inventory.discount_rate)}
            />
            <InfoRow
              label="판매가"
              value={inventory.sale_price == null ? '-' : formatCurrencyKRW(inventory.sale_price)}
            />
          </div>

          <p className="text-xs text-muted-foreground pt-1">마지막 변경: {formatKstDate(inventory.date)}</p>
        </Card>
      )}
    </div>
  );
}
