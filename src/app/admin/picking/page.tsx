import { Suspense } from 'react';
import { PickingStatusListView } from '@/features/picking/components/PickingStatusListView';

export default function PickingStatusPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}>
      <PickingStatusListView />
    </Suspense>
  );
}
