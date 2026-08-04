'use client';

import { useParams } from 'next/navigation';
import { PickingSessionView } from '@/features/picking/components/PickingSessionView';

// 특정 주문의 피킹 세션 화면
export default function PickingSessionPage() {
  const { orderId } = useParams<{ orderId: string }>();
  return <PickingSessionView orderId={orderId} />;
}
