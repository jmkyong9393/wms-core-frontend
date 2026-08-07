import { MapPin, ScanBarcode } from 'lucide-react';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { cn } from '@/lib/utils';
import type { FlattenedPickingItem } from '@/features/picking/utils/flattenPickingGroups';

interface PickingTargetCardProps {
  item: FlattenedPickingItem;
}

function LocationBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-900/50 rounded-xl py-3">
      <span className="text-[11px] font-medium text-orange-500 dark:text-orange-400 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-extrabold text-orange-700 dark:text-orange-300">{value}</span>
    </div>
  );
}

// 백엔드 피킹 지시서 응답에는 도서명이 포함되지 않으므로 ISBN/LPN 바코드를 주요 식별 정보로 표시
export function PickingTargetCard({ item }: PickingTargetCardProps) {
  const isDone = item.picked_quantity >= item.quantity;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      {/* Zone/Rack/Shelf: 화면에서 가장 크게 강조할 위치 정보 */}
      <div className="flex items-center gap-1 mb-2 text-[11px] font-semibold text-gray-400 dark:text-zinc-500">
        <MapPin className="w-3.5 h-3.5" />
        피킹 로케이션
      </div>
      <div className="flex gap-2">
        <LocationBadge label="Zone" value={item.zone} />
        <LocationBadge label="Rack" value={item.rack} />
        <LocationBadge label="Shelf" value={item.shelf} />
      </div>

      <div className="mt-4 flex items-start gap-4">
        {item.cover_image_url ? (
          <img
            src={item.cover_image_url}
            alt={`${item.book_title ?? '도서'} 표지`}
            className="h-32 w-24 shrink-0 rounded-lg border border-border bg-muted object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
            BOOK
          </div>
        )}

        <div className="min-w-0 space-y-1.5">
          <p className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-zinc-100">
            {item.book_title ??
              (item.allocation_type === 'NEW_STOCK'
                ? '신품 도서'
                : '중고·반품 도서')}
          </p>

          {item.isbn && (
            <p className="flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-zinc-400">
              <ScanBarcode className="w-3 h-3 shrink-0" />
              ISBN {item.isbn}
            </p>
          )}

          {item.lpn_barcode && (
            <p className="flex items-center gap-1 break-all text-xs font-mono text-gray-500 dark:text-zinc-400">
              <ScanBarcode className="w-3 h-3 shrink-0" />
              LPN {item.lpn_barcode}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {item.condition_grade && (
          <span
            className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getGradeBadgeStyle(item.condition_grade))}
          >
            {getGradeLabel(item.condition_grade)}
          </span>
        )}
        <div className="flex items-baseline gap-1 ml-auto">
          <span className={cn('text-2xl font-bold', isDone ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-zinc-100')}>
            {item.picked_quantity}
          </span>
          <span className="text-gray-400 dark:text-zinc-500 text-sm">/ {item.quantity}</span>
        </div>
      </div>
    </div>
  );
}
