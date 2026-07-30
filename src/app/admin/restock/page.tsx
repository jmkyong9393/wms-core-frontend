import { Suspense } from 'react';
import { RestockProposalListView } from '@/features/restock/components/RestockProposalListView';

export default function RestockProposalsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400">불러오는 중...</p>}>
      <RestockProposalListView />
    </Suspense>
  );
}
