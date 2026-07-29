'use client';

import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { hitlQueueAtom } from '@/features/queue/store/queueAtoms';
import KpiDonutCard from './KpiDonutCard';
import HitlKanbanPreview from './HitlKanbanPreview';
import SelectedTicketSummaryPanel from './SelectedTicketSummaryPanel';
import ComprehensiveStatsTab from './ComprehensiveStatsTab';

// 전체 건수가 0이면 NaN 대신 0%로 처리
function toRatio(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

export default function DashboardView() {
  const hitlQueue = useAtomValue(hitlQueueAtom);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hitl' | 'stats'>('hitl');

  const total = hitlQueue.length;
  const approvedCount = hitlQueue.filter((item) => item.status === 'APPROVED').length;
  const rejectedCount = hitlQueue.filter((item) => item.status === 'REJECTED').length;
  const processedCount = approvedCount + rejectedCount;
  const pendingCount = total - processedCount;

  const processedRatio = toRatio(processedCount, total);
  const approvalRatio = toRatio(approvedCount, total);
  const rejectionRatio = toRatio(rejectedCount, total);
  const pendingRatio = toRatio(pendingCount, total);

  const selectedItem = useMemo(() => {
    return (
      hitlQueue.find((item) => item.id === selectedTicketId) ??
      hitlQueue.find((item) => item.status === 'AWAITING_REVIEW') ??
      hitlQueue[0] ??
      null
    );
  }, [hitlQueue, selectedTicketId]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-3 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">물류 센터 통합 대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">실시간 AI 검수 현황 및 재고/FDS 종합 통계 분석</p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('hitl')}
            className={`px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'hitl'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            실시간 검수 (HITL)
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            종합 통계 & FDS 리포트
          </button>
        </div>
      </div>

      {activeTab === 'hitl' ? (
        <>
          {/* KPI 카드 4개 (어제 대비 추세는 실제 일자별 집계가 없어 고정 mock값) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
            <div className="lg:col-span-3 min-h-0">
              <HitlKanbanPreview
                queue={hitlQueue}
                selectedId={selectedItem?.id ?? null}
                onSelect={setSelectedTicketId}
              />
            </div>
            <div className="lg:col-span-1 min-h-0">
              <SelectedTicketSummaryPanel item={selectedItem} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <ComprehensiveStatsTab />
        </div>
      )}
    </div>
  );
}
