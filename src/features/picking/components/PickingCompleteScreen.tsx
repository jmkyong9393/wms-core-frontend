'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { getGradeBadgeStyle, getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { cn } from '@/lib/utils';
import { useConfirmShipmentMutation } from '@/features/picking/hooks/usePickingMutations';
import { getPickingErrorMessage } from '@/features/picking/utils/pickingErrorMessage';
import type { ConfirmShipmentConflictDetail, ShipmentConfirmResponse } from '@/features/picking/types/picking';
import type { FlattenedPickingItem } from '@/features/picking/utils/flattenPickingGroups';

interface PickingCompleteScreenProps {
  orderId: string;
  items: FlattenedPickingItem[];
  onConfirmed: (result: ShipmentConfirmResponse) => void;
  onNavigateToAllocation: (allocationId: string) => void;
}

function getConflictDetail(error: unknown): ConfirmShipmentConflictDetail | null {
  if (isAxiosError(error) && error.response?.status === 409) {
    const detail = error.response.data?.detail;
    if (detail && typeof detail === 'object' && Array.isArray(detail.incomplete_new_allocations)) {
      return detail as ConfirmShipmentConflictDetail;
    }
  }
  return null;
}

// 피킹 완료 후 출고 확정 화면
export function PickingCompleteScreen({ orderId, items, onConfirmed, onNavigateToAllocation }: PickingCompleteScreenProps) {
  const confirmMutation = useConfirmShipmentMutation(orderId);

  const totalPickedUnits = items.reduce((acc, item) => acc + item.picked_quantity, 0);
  const conflict = getConflictDetail(confirmMutation.error);
  // 미완료 스캔(409) 외의 오류(권한, 네트워크 등)는 일반 오류 문구로 안내
  const genericErrorMessage =
    confirmMutation.isError && !conflict ? getPickingErrorMessage(confirmMutation.error) : null;

  const handleConfirm = () => {
    confirmMutation.mutate(undefined, {
      onSuccess: (result) => onConfirmed(result),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* 완료 안내 */}
      <div className="flex flex-col items-center text-center py-6">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 mb-3" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">피킹이 모두 완료되었습니다</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          총 {items.length}개 대상 / {totalPickedUnits}권 처리
        </p>
      </div>

      {/* 피킹 완료 목록 */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.allocation_id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                {item.isbn ?? item.lpn_barcode ?? item.allocation_id}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {item.zone}-{item.rack}-{item.shelf}
              </p>
            </div>
            <div className="flex items-center gap-2 pl-3 shrink-0">
              {item.condition_grade && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                    getGradeBadgeStyle(item.condition_grade)
                  )}
                >
                  {getGradeLabel(item.condition_grade)}
                </span>
              )}
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                {item.picked_quantity}/{item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {genericErrorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2 text-center">
          {genericErrorMessage}
        </p>
      )}

      {conflict && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-3 space-y-2">
          <p className="text-sm text-red-700 dark:text-red-300 font-semibold">{conflict.message}</p>
          <div className="space-y-1.5">
            {conflict.incomplete_new_allocations.map((a) => (
              <button
                key={a.allocation_id}
                type="button"
                onClick={() => onNavigateToAllocation(a.allocation_id)}
                className="w-full flex items-center justify-between text-xs text-red-700 dark:text-red-300 bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <span>미완료 항목 ({a.picked_quantity}/{a.expected_quantity})</span>
                <span className="font-semibold">다시 스캔하기</span>
              </button>
            ))}
            {conflict.incomplete_used_allocations.map((a) => (
              <button
                key={a.allocation_id}
                type="button"
                onClick={() => onNavigateToAllocation(a.allocation_id)}
                className="w-full flex items-center justify-between text-xs text-red-700 dark:text-red-300 bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <span>미완료 중고 LPN 항목</span>
                <span className="font-semibold">다시 스캔하기</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleConfirm}
        disabled={confirmMutation.isPending}
        className="w-full h-12 rounded-xl text-lg font-bold"
      >
        {confirmMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> 출고 확정 처리 중...
          </span>
        ) : (
          '출고 확정'
        )}
      </Button>
    </div>
  );
}
