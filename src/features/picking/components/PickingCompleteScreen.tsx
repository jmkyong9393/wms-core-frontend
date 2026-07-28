'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { cn } from '@/lib/utils';
import type { PickingListItem } from '@/features/picking/types/picking';

interface PickingCompleteScreenProps {
  items: PickingListItem[];
  pickedQtyMap: Record<string, number>;
}

// 피킹 완료 결과 화면
export function PickingCompleteScreen({ items, pickedQtyMap }: PickingCompleteScreenProps) {
  const router = useRouter();

  // 전체 피킹 수량 계산
  const totalPickedUnits = items.reduce((acc, item) => acc + Math.min(pickedQtyMap[item.id] ?? 0, item.quantity), 0);

  // 작업자 홈으로 이동
  const handleFinish = () => {
    router.push('/inbound');
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* 완료 안내 */}
      <div className="flex flex-col items-center text-center py-6">
        <CheckCircle2 className="h-14 w-14 text-green-600 mb-3" />
        <h1 className="text-xl font-bold text-gray-900">피킹이 모두 완료되었습니다</h1>
        <p className="text-sm text-gray-500 mt-1">
          총 {items.length}개 대상 / {totalPickedUnits}권 처리
        </p>
      </div>

      {/* 피킹 완료 목록 */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.bookTitle}</p>
              <p className="text-xs text-gray-500">
                {item.zone}-{item.rack}-{item.shelf}
              </p>
            </div>
            <div className="flex items-center gap-2 pl-3 shrink-0">
              <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', getGradeBadgeStyle(item.conditionGrade))}>
                {getGradeLabel(item.conditionGrade)}
              </span>
              <span className="text-sm font-bold text-green-700">
                {pickedQtyMap[item.id] ?? 0}/{item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" onClick={handleFinish} className="w-full h-12 rounded-xl text-lg font-bold">
        피킹 종료
      </Button>
    </div>
  );
}
