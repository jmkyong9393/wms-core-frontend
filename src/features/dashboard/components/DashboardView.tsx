'use client';

import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { hitlQueueAtom } from '@/features/queue/store/queueAtoms';
import KpiDonutCard from './KpiDonutCard';
import HitlKanbanPreview from './HitlKanbanPreview';
import SelectedTicketSummaryPanel from './SelectedTicketSummaryPanel';
import SuggestedPoPlaceholder from './SuggestedPoPlaceholder';
import InventoryPreview from './InventoryPreview';

// 0으로 나누는 경우(큐가 비었을 때) NaN 대신 0%로 처리
function toRatio(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

export default function DashboardView() {
  const hitlQueue = useAtomValue(hitlQueueAtom);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const total = hitlQueue.length;
  const approvedCount = hitlQueue.filter((item) => item.status === 'APPROVED').length;
  const rejectedCount = hitlQueue.filter((item) => item.status === 'REJECTED').length;
  const processedCount = approvedCount + rejectedCount;
  const pendingCount = total - processedCount;

  const processedRatio = toRatio(processedCount, total);
  const approvalRatio = toRatio(approvedCount, total);
  const rejectionRatio = toRatio(rejectedCount, total);
  const pendingRatio = toRatio(pendingCount, total);

  // 선택된 티켓이 승인/반려로 목록에서 사라지면 남은 첫 항목으로 자동 전환, 없으면 빈 상태
  const selectedItem = useMemo(() => {
    return (
      hitlQueue.find((item) => item.id === selectedTicketId) ??
      hitlQueue.find((item) => item.status === 'AWAITING_REVIEW') ??
      hitlQueue[0] ??
      null
    );
  }, [hitlQueue, selectedTicketId]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-3">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">물류 센터 통합 대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">실시간 AI 검수 현황 및 재고 요약</p>
      </div>

      {/* KPI 카드 4개 (전부 hitlQueueAtom 파생값. 어제 대비 추세는 실제 일자별 집계가 없어 고정 mock값) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiDonutCard
          label="금일 누적 처리량"
          centerValue={`${processedCount}건`}
          ratio={processedRatio}
          colorClass="text-indigo-600"
          variant="bar"
          barSegments={[
            { label: '대기', ratio: pendingRatio, colorClass: 'bg-yellow-400' },
            { label: '완료', ratio: processedRatio, colorClass: 'bg-indigo-500' },
          ]}
          trend={{ direction: 'up', label: '18.6%' }}
        />
        <KpiDonutCard
          label="실시간 자동 승인율"
          centerValue={`${Math.round(approvalRatio)}%`}
          ratio={approvalRatio}
          colorClass="text-green-600"
          trend={{ direction: 'up', label: '3.4%' }}
        />
        <KpiDonutCard
          label="에이전트 반려율"
          centerValue={`${Math.round(rejectionRatio)}%`}
          ratio={rejectionRatio}
          colorClass="text-red-500"
          trend={{ direction: 'down', label: '1.2%' }}
        />
        <KpiDonutCard
          label="검토 대기건수"
          centerValue={`${pendingCount}건`}
          ratio={pendingRatio}
          colorClass="text-yellow-600"
          trend={{ direction: 'down', label: '11.3%' }}
        />
      </div>

      {/* HITL 처리 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3">
          <HitlKanbanPreview
            queue={hitlQueue}
            selectedId={selectedItem?.id ?? null}
            onSelect={setSelectedTicketId}
          />
        </div>
        <div className="lg:col-span-1 lg:row-span-2">
          <SelectedTicketSummaryPanel item={selectedItem} />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InventoryPreview />
          <SuggestedPoPlaceholder />
        </div>
      </div>
    </div>
  );
}
