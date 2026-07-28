'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePickingSessionQuery } from '@/features/picking/hooks/usePickingSessionQuery';
import { PickingProgressHeader } from '@/features/picking/components/PickingProgressHeader';
import { PickingTargetCard } from '@/features/picking/components/PickingTargetCard';
import { PickingScanAction } from '@/features/picking/components/PickingScanAction';
import { PickingCompleteScreen } from '@/features/picking/components/PickingCompleteScreen';

interface PickingSessionViewProps {
  orderId: string;
}

// 피킹 진행 상태 관리의 책임
export function PickingSessionView({ orderId }: PickingSessionViewProps) {
  const { data: session, isLoading, isError } = usePickingSessionQuery(orderId);

  // 현재 피킹 순서와 처리 수량
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pickedQtyMap, setPickedQtyMap] = useState<Record<string, number>>({});

  const items = useMemo(() => session?.items ?? [], [session]);
  const currentItem = items[currentIndex];
  const currentPickedQty = currentItem ? pickedQtyMap[currentItem.id] ?? 0 : 0;

  // 전체 피킹 수량
  const totalUnits = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  // 현재까지 처리한 수량

  const pickedUnits = useMemo(
    () => items.reduce((acc, item) => acc + Math.min(pickedQtyMap[item.id] ?? 0, item.quantity), 0),
    [items, pickedQtyMap]
  );

  // 현재 항목 완료 후 다음 항목으로 이동
  useEffect(() => {
    if (currentItem && currentPickedQty >= currentItem.quantity) {
      const timer = setTimeout(() => setCurrentIndex((prev) => prev + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [currentItem, currentPickedQty]);

  // 피킹 수량 1개 증가
  const handlePick = (itemId: string) => {
    setPickedQtyMap((prev) => {
      const item = items.find((it) => it.id === itemId);
      if (!item) return prev;
      const nextQty = Math.min((prev[itemId] ?? 0) + 1, item.quantity);
      return { ...prev, [itemId]: nextQty };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm">피킹 지시서를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 text-sm text-center px-4">
        피킹 지시서를 불러오지 못했습니다.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
        피킹할 항목이 없습니다.
      </div>
    );
  }

  const isSessionComplete = currentIndex >= items.length;

  if (isSessionComplete) {
    return <PickingCompleteScreen items={items} pickedQtyMap={pickedQtyMap} />;
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
      <PickingTargetCard item={currentItem} pickedQty={currentPickedQty} />
      <PickingScanAction item={currentItem} pickedQty={currentPickedQty} onPick={() => handlePick(currentItem.id)} />
    </div>
  );
}
