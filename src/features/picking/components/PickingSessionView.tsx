'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePickingInstructionQuery } from '@/features/picking/hooks/usePickingInstructionQuery';
import { useConfirmShipmentMutation } from '@/features/picking/hooks/usePickingMutations';
import { PickingProgressHeader } from '@/features/picking/components/PickingProgressHeader';
import { PickingTargetCard } from '@/features/picking/components/PickingTargetCard';
import { PickingScanAction } from '@/features/picking/components/PickingScanAction';
import { PickingCompleteScreen } from '@/features/picking/components/PickingCompleteScreen';
import { WaybillPreview } from '@/features/picking/components/WaybillPreview';
import { flattenPickingGroups } from '@/features/picking/utils/flattenPickingGroups';
import type { ShipmentConfirmResponse } from '@/features/picking/types/picking';

interface PickingSessionViewProps {
  orderId: string;
}

// 서버의 피킹 진행 상태에 따라 스캔, 출고 확정, 송장 화면을 구분
export function PickingSessionView({ orderId }: PickingSessionViewProps) {
  const { data, isLoading, isError } = usePickingInstructionQuery(orderId);
  const fetchWaybillMutation = useConfirmShipmentMutation(orderId);

  // 출고 확정 실패 시 다시 확인할 품목
  const [focusedAllocationId, setFocusedAllocationId] = useState<string | null>(null);
  // 출고 확정 후 받은 송장 정보
  const [shipmentResult, setShipmentResult] = useState<ShipmentConfirmResponse | null>(null);

  const items = useMemo(() => (data ? flattenPickingGroups(data.picking_groups) : []), [data]);
  const totalUnits = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const pickedUnits = useMemo(() => items.reduce((acc, item) => acc + item.picked_quantity, 0), [items]);

  const firstIncompleteIndex = items.findIndex((item) => !item.is_completed);
  const focusedIndex = focusedAllocationId
    ? items.findIndex((item) => item.allocation_id === focusedAllocationId && !item.is_completed)
    : -1;
  const currentIndex = focusedIndex >= 0 ? focusedIndex : firstIncompleteIndex;
  const currentItem = currentIndex >= 0 ? items[currentIndex] : undefined;

  // 출고 완료 주문에 다시 들어오면 기존 송장 정보를 다시 조회
  useEffect(() => {
    if (data?.status === 'SHIPPED' && !shipmentResult && !fetchWaybillMutation.isPending) {
      fetchWaybillMutation.mutate(undefined, { onSuccess: setShipmentResult });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status, shipmentResult]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">피킹 지시서를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 dark:text-red-400 text-sm text-center px-4">
        피킹 지시서를 불러오지 못했습니다.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-zinc-500 text-sm">
        피킹할 항목이 없습니다.
      </div>
    );
  }

  if (data.status === 'SHIPPED') {
    if (!shipmentResult) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">송장 정보를 불러오는 중...</p>
        </div>
      );
    }
    return <WaybillPreview result={shipmentResult} />;
  }

  if (data.is_picking_completed) {
    return (
      <PickingCompleteScreen
        orderId={orderId}
        items={items}
        onConfirmed={setShipmentResult}
        onNavigateToAllocation={setFocusedAllocationId}
      />
    );
  }

  if (!currentItem) return null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <PickingProgressHeader
        currentIndex={currentIndex}
        totalItems={items.length}
        pickedUnits={pickedUnits}
        totalUnits={totalUnits}
      />
      <PickingTargetCard item={currentItem} />
      <PickingScanAction orderId={orderId} item={currentItem} />
    </div>
  );
}
