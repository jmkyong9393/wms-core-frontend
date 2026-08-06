import { ShoppingCart } from 'lucide-react';

interface PickingProgressHeaderProps {
  currentIndex: number;
  totalItems: number;
  pickedUnits: number;
  totalUnits: number;
}

export function PickingProgressHeader({
  currentIndex,
  totalItems,
  pickedUnits,
  totalUnits,
}: PickingProgressHeaderProps) {
  const currentPosition = Math.min(currentIndex + 1, totalItems);

  return (
    <div className="flex-none p-4 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shadow-sm sticky top-14 z-20">
      <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        출고 피킹 (Picking)
      </h1>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
          현재 피킹 대상{' '}
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {currentPosition} / {totalItems}
          </span>
        </span>
        <span className="text-xs text-gray-400 dark:text-zinc-500">
          전체 수량 {pickedUnits} / {totalUnits}
        </span>
      </div>
    </div>
  );
}
