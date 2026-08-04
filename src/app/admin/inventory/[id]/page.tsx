'use client';

import { useParams } from 'next/navigation';
import { InventoryDetailView } from '@/features/inventory/components/InventoryDetailView';

// 신간 묶음 재고 단건 상세 화면
export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <InventoryDetailView inventoryId={id} />;
}
