'use client';

import { useParams } from 'next/navigation';
import { LpnDetailView } from '@/features/lpn/components/LpnDetailView';

// LPN 바코드 기준 단품 재고 상세 화면
export default function LpnDetailPage() {
  const { barcode } = useParams<{ barcode: string }>();
  return <LpnDetailView lpnBarcode={decodeURIComponent(barcode)} />;
}
