'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PickingItem {
  id: string;
  barcode: string;
  name: string;
  targetQty: number;
  pickedQty: number;
}

// 목업 데이터 (실제로는 백엔드 API에서 출고 지시서를 받아옴)
const MOCK_PICKING_LIST: PickingItem[] = [
  { id: '1', barcode: '8801043015456', name: '신라면 1박스', targetQty: 2, pickedQty: 0 },
  { id: '2', barcode: '8801062012419', name: '초코파이 12개입', targetQty: 1, pickedQty: 0 },
  { id: '3', barcode: 'ITEM-999', name: '물류센터 전용 박스 (대)', targetQty: 5, pickedQty: 0 },
];

export default function PickingPage() {
  const [pickingList, setPickingList] = useState<PickingItem[]>(MOCK_PICKING_LIST);
  const [isScannerActive, setIsScannerActive] = useState(true);

  const handleScan = (result: string) => {
    setPickingList(prev => 
      prev.map(item => {
        if (item.barcode === result && item.pickedQty < item.targetQty) {
          return { ...item, pickedQty: item.pickedQty + 1 };
        }
        return item;
      })
    );
  };

  const isAllPicked = pickingList.every(item => item.pickedQty >= item.targetQty);

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      <div className="flex-none p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-orange-600" />
          출고 피킹 (Picking)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          출고 지시서에 맞춰 상품 바코드를 스캔해 주세요.
        </p>
      </div>

      <div className="flex-none p-4">
        <BarcodeScanner onScan={handleScan} isActive={isScannerActive} />
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            진행 상태: <span className={cn("text-lg font-bold", isAllPicked ? "text-green-600" : "text-orange-600")}>
              {pickingList.reduce((acc, cur) => acc + cur.pickedQty, 0)} / {pickingList.reduce((acc, cur) => acc + cur.targetQty, 0)}
            </span>
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
          {pickingList.map((item) => {
            const isCompleted = item.pickedQty >= item.targetQty;
            return (
              <div 
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all duration-300",
                  isCompleted 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-gray-100"
                )}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className={isCompleted ? "text-green-600" : "text-gray-300"}>
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      isCompleted ? "text-green-900 line-through opacity-70" : "text-gray-900"
                    )}>
                      {item.name}
                    </p>
                    <p className="text-xs font-mono text-gray-500 truncate">
                      {item.barcode}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 pl-4">
                  <span className={cn(
                    "text-2xl font-bold",
                    isCompleted ? "text-green-700" : "text-gray-900"
                  )}>
                    {item.pickedQty}
                  </span>
                  <span className="text-gray-400 text-sm">/ {item.targetQty}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {isAllPicked && (
        <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-30 animate-in slide-in-from-bottom-4">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-green-600/20">
            피킹 완료 및 승인
          </Button>
        </div>
      )}
    </div>
  );
}
