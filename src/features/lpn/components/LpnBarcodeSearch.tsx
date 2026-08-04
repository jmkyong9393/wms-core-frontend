'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine } from 'lucide-react';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// LPN 바코드를 스캔하거나 직접 입력해 상세 조회로 이동
export function LpnBarcodeSearch() {
  const router = useRouter();
  const [barcode, setBarcode] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const goToDetail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/admin/lpn/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">LPN 단품 조회</h2>
        <p className="text-sm text-gray-500 mt-1">
          중고·반품 단품 재고의 LPN 바코드를 스캔하거나 직접 입력해 상세 정보와 가격을 확인합니다.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="LPN 바코드 입력 (예: LPN-XXXXXXXX)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') goToDetail(barcode);
          }}
        />
        <Button type="button" onClick={() => goToDetail(barcode)} disabled={!barcode.trim()}>
          조회
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsScannerOpen((prev) => !prev)}
        className="w-full rounded-full"
      >
        <ScanLine className="w-4 h-4 mr-1.5" />
        {isScannerOpen ? '카메라 닫기' : '카메라로 바코드 스캔'}
      </Button>

      {isScannerOpen && <BarcodeScanner onScan={goToDetail} isActive={isScannerOpen} />}
    </div>
  );
}
