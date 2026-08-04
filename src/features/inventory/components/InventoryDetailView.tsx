'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useInventoryDetailQuery } from '@/features/inventory/hooks/useInventoryDetailQuery';
import { getInventoryGradeBadgeStyle, getInventoryGradeLabel } from '@/features/inventory/utils/gradeBadge';
import { getPricingStatusBadgeStyle, getPricingStatusLabel } from '@/features/inventory/utils/pricingStatusBadge';
import { formatCurrencyKRW, formatDiscountRate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface InventoryDetailViewProps {
  inventoryId: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
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
        className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="w-4 h-4" />
        재고 목록으로 돌아가기
      </button>

      {isLoading && <p className="text-sm text-gray-400">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-600">재고 상세 정보를 불러오지 못했습니다.</p>}

      {inventory && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{inventory.book.title}</h2>
              <p className="text-xs font-mono text-gray-500 mt-0.5">ISBN {inventory.book.isbn ?? '-'}</p>
            </div>
            <span
              className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', getInventoryGradeBadgeStyle(inventory.grade))}
            >
              {getInventoryGradeLabel(inventory.grade)}
            </span>
          </div>

          <div>
            <InfoRow label="보관 위치" value={inventory.zone} />
            <InfoRow label="재고 수량" value={`${inventory.quantity}권`} />
            <InfoRow label="예약 수량" value={`${inventory.reserved_quantity}권`} />
            <InfoRow label="출고 가능 수량" value={`${inventory.available_quantity}권`} />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">가격 정보</span>
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

          <p className="text-xs text-gray-400 pt-1">마지막 변경: {inventory.date.slice(0, 10)}</p>
        </div>
      )}
    </div>
  );
}
