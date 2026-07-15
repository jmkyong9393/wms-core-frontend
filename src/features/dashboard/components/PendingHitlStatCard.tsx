'use client';

import { useAtomValue } from 'jotai';
import { ClipboardList } from 'lucide-react';
import { pendingHitlCountAtom } from '@/features/queue/store/queueAtoms';
import StatCard from './StatCard';

// 관리자 검토 대기 건수를 표시하는 카드
export default function PendingHitlStatCard() {
  const pendingHitlCount = useAtomValue(pendingHitlCountAtom);

  return (
    <StatCard
      icon={ClipboardList}
      label="검토 대기"
      value={pendingHitlCount}
      unit="건"
      colorClass="bg-yellow-50 text-yellow-600"
    />
  );
}