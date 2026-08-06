'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { hitlQueueAtom, mergeHitlQueueFromServerAtom } from '@/features/queue/store/queueAtoms';
import { useInspectionHistoryQuery } from '@/features/inspections/hooks/useInspectionHistoryQuery';
import { useInspectionMetricsQuery } from '@/features/queue/hooks/useInspectionMetricsQuery';
import KpiDonutCard from '@/features/queue/components/KpiDonutCard';
import HitlKanbanPreview from '@/features/queue/components/HitlKanbanPreview';
import SelectedTicketSummaryPanel from '@/features/queue/components/SelectedTicketSummaryPanel';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

// 전체 건수가 0이면 NaN 대신 0%로 처리
function toRatio(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

export default function HitlQueueView() {
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const mergeQueue = useSetAtom(mergeHitlQueueFromServerAtom);
  const queue = useAtomValue(hitlQueueAtom);

  // 검토가 필요한(HITL_REQUIRED) 검수 건 목록 — 별도 HITL 목록 API 없이 검수 이력 API에 상태 필터만 사용
  const { data } = useInspectionHistoryQuery({ status: 'HITL_REQUIRED', page, size: PAGE_SIZE });

  // 페이지 조회 결과가 오면 큐에 병합 (id는 return_job_id와 동일해 상세·로그·판정에 그대로 사용 가능)
  // 이미 검토중/판정 완료로 로컬 반영된 항목은 재조회로 AWAITING_REVIEW로 되돌아가지 않도록 병합 atom이 보존함
  useEffect(() => {
    if (!data) return;
    mergeQueue(
      data.items.map((row) => ({
        id: row.id,
        title: row.bookTitle,
        ubciScore: row.ubciScore ?? undefined,
      }))
    );
  }, [data, mergeQueue]);

  const totalPages = data?.total_pages ?? 0;

  const selectedItem = useMemo(() => {
    return (
      queue.find((item) => item.id === selectedTicketId) ??
      queue.find((item) => item.status === 'AWAITING_REVIEW') ??
      queue[0] ??
      null
    );
  }, [queue, selectedTicketId]);

  // KPI 카드는 페이지네이션과 무관하게 전체 ReturnJob을 집계하는 실제 API 기준
  const { data: metrics } = useInspectionMetricsQuery();
  const total = metrics?.total_jobs ?? 0;
  const approvedCount = metrics?.approved_jobs ?? 0;
  const rejectedCount = metrics?.rejected_jobs ?? 0;
  const hitlRequiredCount = metrics?.hitl_required_jobs ?? 0;
  const processedCount = approvedCount + rejectedCount;

  const processedRatio = toRatio(processedCount, total);
  const approvalRatio = toRatio(approvedCount, total);
  const rejectionRatio = toRatio(rejectedCount, total);
  const hitlRequiredRatio = toRatio(hitlRequiredCount, total);

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      {/* 페이지 제목과 설명 */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">HITL 처리 현황</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI 신뢰도가 낮아 관리자의 검토·승인·반려가 필요한 항목입니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiDonutCard
          label="금일 누적 처리량"
          centerValue={`${processedCount}건`}
          ratio={processedRatio}
          colorClass="text-indigo-600 dark:text-indigo-400"
          variant="bar"
          barSegments={[
            { label: '대기', ratio: 100 - processedRatio, colorClass: 'bg-yellow-400 dark:bg-yellow-500' },
            { label: '완료', ratio: processedRatio, colorClass: 'bg-indigo-500 dark:bg-indigo-400' },
          ]}
        />
        <KpiDonutCard
          label="실시간 자동 승인율"
          centerValue={`${Math.round(approvalRatio)}%`}
          ratio={approvalRatio}
          colorClass="text-green-600 dark:text-green-400"
        />
        <KpiDonutCard
          label="에이전트 반려율"
          centerValue={`${Math.round(rejectionRatio)}%`}
          ratio={rejectionRatio}
          colorClass="text-red-500 dark:text-red-400"
        />
        <KpiDonutCard
          label="검토 대기건수"
          centerValue={`${hitlRequiredCount}건`}
          ratio={hitlRequiredRatio}
          colorClass="text-yellow-600 dark:text-yellow-400"
        />
      </div>

      {/* HITL 처리 현황 3열 보드 + 선택 티켓 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-[420px]">
        <div className="lg:col-span-3 min-h-0">
          <HitlKanbanPreview
            queue={queue}
            selectedId={selectedItem?.id ?? null}
            onSelect={setSelectedTicketId}
          />
        </div>
        <div className="lg:col-span-1 min-h-0">
          <SelectedTicketSummaryPanel item={selectedItem} />
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            이전
          </Button>
          <span className="text-xs text-muted-foreground">
            페이지 {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
