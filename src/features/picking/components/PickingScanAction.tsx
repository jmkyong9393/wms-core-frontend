'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScanPickingAllocationMutation } from '@/features/picking/hooks/usePickingMutations';
import { getPickingErrorMessage } from '@/features/picking/utils/pickingErrorMessage';
import type { FlattenedPickingItem } from '@/features/picking/utils/flattenPickingGroups';

interface PickingScanActionProps {
  orderId: string;
  item: FlattenedPickingItem;
}

// 바코드 스캔(카메라) 및 수동 바코드 입력 - 두 경로 모두 실제 /scan API로 검증
export function PickingScanAction({ orderId, item }: PickingScanActionProps) {
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const scanMutation = useScanPickingAllocationMutation(orderId);

  const submitScan = (barcode: string) => {
    setInfoMessage(null);
    scanMutation.mutate(
      { allocation_type: item.allocation_type, allocation_id: item.allocation_id, barcode },
      {
        onSuccess: (response) => {
          // 이미 완료된 중고 LPN 재스캔은 200 성공 + 안내 메시지로 내려온다 (에러 아님, 수량 변화 없음)
          if (response.picked_quantity === item.picked_quantity && response.is_completed) {
            setInfoMessage(response.message);
          }
        },
      }
    );
  };

  const handleScan = (result: string) => submitScan(result);

  const handleManualSubmit = () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) return;
    submitScan(trimmed);
    setManualBarcode('');
  };

  const errorMessage = scanMutation.isError ? getPickingErrorMessage(scanMutation.error) : null;

  return (
    <div className="space-y-3">
      <BarcodeScanner onScan={handleScan} isActive={isScannerActive && !isManualEntryOpen} />

      {errorMessage && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMessage}</p>
      )}
      {infoMessage && (
        <p className="text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{infoMessage}</p>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsManualEntryOpen((prev) => !prev)}
          className="flex-1 rounded-full"
        >
          바코드 직접 입력
        </Button>
      </div>

      {isManualEntryOpen && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="ISBN 또는 LPN 바코드 입력"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleManualSubmit();
            }}
          />
          <Button
            type="button"
            onClick={handleManualSubmit}
            disabled={scanMutation.isPending || !manualBarcode.trim()}
            className="rounded-full"
          >
            확인
          </Button>
        </div>
      )}

      {/* 현재 처리 수량 */}
      <p className="text-center text-xs text-gray-400">
        현재까지 처리: <span className="font-semibold text-gray-600">{item.picked_quantity}</span> / {item.quantity}
      </p>
    </div>
  );
}
