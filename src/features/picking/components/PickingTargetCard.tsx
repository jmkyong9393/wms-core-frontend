import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { cn } from '@/lib/utils';
import type { PickingListItem } from '@/features/picking/types/picking';

interface PickingTargetCardProps {
  item: PickingListItem;
  pickedQty: number;
}

function LocationBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-orange-50 border-2 border-orange-200 rounded-xl py-3">
      <span className="text-[11px] font-medium text-orange-500 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-extrabold text-orange-700">{value}</span>
    </div>
  );
}

export function PickingTargetCard({ item, pickedQty }: PickingTargetCardProps) {
  const isDone = pickedQty >= item.quantity;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Zone/Rack/Shelf: 화면에서 가장 크게 강조할 위치 정보 */}
      <div className="flex gap-2">
        <LocationBadge label="Zone" value={item.zone} />
        <LocationBadge label="Rack" value={item.rack} />
        <LocationBadge label="Shelf" value={item.shelf} />
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-lg font-bold text-gray-900">{item.bookTitle}</p>
        <p className="text-xs font-mono text-gray-500">ISBN {item.isbn}</p>
        {item.lpnBarcode && <p className="text-xs font-mono text-gray-500">LPN {item.lpnBarcode}</p>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getGradeBadgeStyle(item.conditionGrade))}>
          {getGradeLabel(item.conditionGrade)}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-bold', isDone ? 'text-green-600' : 'text-gray-900')}>
            {pickedQty}
          </span>
          <span className="text-gray-400 text-sm">/ {item.quantity}</span>
        </div>
      </div>
    </div>
  );
}
