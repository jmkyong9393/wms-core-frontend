'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PickingStatusDetailView } from '@/features/picking/components/PickingStatusDetailView';

// 관리자용 피킹 현황 상세 화면
export default function PickingStatusDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
      <PickingStatusDetailView orderId={orderId} />
    </Suspense>
  );
}
