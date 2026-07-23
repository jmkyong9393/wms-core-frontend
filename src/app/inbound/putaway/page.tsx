'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle2 } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      <div className="flex-none p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          입고 적치 (Put-away)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          보관할 상품이나 위치 바코드를 스캔해 주세요.
        </p>
      </div>

      <div className="flex-none p-4">
        <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            스캔 완료: <span className="text-blue-600 text-lg">{scannedItems.length}</span> 건
          </span>
          <Button 
            variant={isScannerActive ? "outline" : "default"}
            onClick={() => setIsScannerActive(!isScannerActive)}
            className="rounded-full px-6"
          >
            {isScannerActive ? '스캐너 일시정지' : '스캐너 켜기'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="space-y-3">
          {scannedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
              스캔된 바코드가 없습니다.
            </div>
          ) : (
            scannedItems.map((item) => (
              <div 
                key={item.timestamp}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-full text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono font-medium text-gray-900">{item.barcode}</p>
                    <p className="text-xs text-gray-400">
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
