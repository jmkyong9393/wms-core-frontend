'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import type { PickingListItem } from '@/features/picking/types/picking';

interface PickingScanActionProps {
  item: PickingListItem;
  pickedQty: number;
  onPick: () => void;
}

// 바코드 스캔 및 수동 피킹 처리
export function PickingScanAction({ item, pickedQty, onPick }: PickingScanActionProps) {
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  const expectedCode = item.lpnBarcode ?? item.isbn;

  // 스캔한 바코드 확인
  const handleScan = (result: string) => {
    if (result === expectedCode) {
      setMismatchError(null);
      onPick();
    } else {
      setMismatchError(`대상 바코드와 일치하지 않습니다: ${result}`);
    }
  };

  // 스캔 없이 1권 처리
  const handleManualPick = () => {
    setMismatchError(null);
    onPick();
  };

  return (
    <div className="space-y-3">
      <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />

      {mismatchError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {mismatchError}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isScannerActive ? 'outline' : 'default'}
          onClick={() => setIsScannerActive((prev) => !prev)}
          className="flex-1 rounded-full"
        >
          {isScannerActive ? '스캐너 일시정지' : '스캐너 켜기'}
        </Button>
        <Button type="button" variant="outline" onClick={handleManualPick} className="flex-1 rounded-full">
          직접 완료 처리
        </Button>
      </div>
      {/* 현재 처리 수량 */}
      <p className="text-center text-xs text-gray-400">
        현재까지 처리: <span className="font-semibold text-gray-600">{pickedQty}</span> / {item.quantity}
      </p>
    </div>
  );
}
