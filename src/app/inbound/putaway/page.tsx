'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2, ScanBarcode } from 'lucide-react';

interface ScannedItem {
  barcode: string;
  timestamp: number;
}

export default function PutawayPage() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScannerActive, setIsScannerActive] = useState(true);

  const handleScan = (result: string) => {
    // 이미 스캔된 바코드인지 확인 (간단한 중복 방지)
    if (scannedItems.some(item => item.barcode === result)) {
      return;
    }

    setScannedItems(prev => [
      { barcode: result, timestamp: Date.now() },
      ...prev
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      <div className="flex-none p-4 bg-card border-b border-border shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          입고 적치 (Put-away)
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          보관할 상품이나 위치 바코드를 스캔해 주세요.
        </p>
      </div>

      <div className="flex-none p-4">
        <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            스캔 완료: <span className="text-primary text-lg font-bold">{scannedItems.length}</span> 건
          </span>
          <Button
            variant={isScannerActive ? "outline" : "default"}
            onClick={() => setIsScannerActive(!isScannerActive)}
            size="lg"
            className="h-11 rounded-full px-6"
          >
            {isScannerActive ? '스캐너 일시정지' : '스캐너 켜기'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="space-y-3">
          {scannedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-zinc-600 text-sm bg-card rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
              스캔된 바코드가 없습니다.
            </div>
          ) : (
            scannedItems.map((item) => (
              <div
                key={item.timestamp}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-full text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 font-mono font-medium text-gray-900 dark:text-zinc-100">
                      <ScanBarcode className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {item.barcode}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
