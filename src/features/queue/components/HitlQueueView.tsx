'use client';

import { useCallback, useMemo, useState } from 'react';
import KpiDonutCard from './KpiDonutCard';
import type { HitlQueueItem } from '@/features/queue/api/hitlQueueService';
import HitlKanbanPreview, {
  type HitlKanbanColumn,
} from './HitlKanbanPreview';
import HitlTicketDetailDialog from './HitlTicketDetailDialog';
import {
  useHitlQueueInfiniteQuery,
  useHitlQueueMetricsQuery,
} from '@/features/queue/hooks/useHitlQueueQuery';


export default function HitlQueueView() {
  const [selectedItem, setSelectedItem] = useState<HitlQueueItem | null>(null);

  const pendingQuery = useHitlQueueInfiniteQuery('PENDING');
  const inReviewQuery = useHitlQueueInfiniteQuery('IN_REVIEW');
  const recheckQuery = useHitlQueueInfiniteQuery('RECHECK');
  const completedQuery = useHitlQueueInfiniteQuery('COMPLETED');
  const metricsQuery = useHitlQueueMetricsQuery();

  const pendingItems = useMemo(
    () => pendingQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [pendingQuery.data]
  );

  const inReviewItems = useMemo(
    () => inReviewQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [inReviewQuery.data]
  );

  const recheckItems = useMemo(
    () => recheckQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [recheckQuery.data]
  );

  const completedItems = useMemo(
    () => completedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [completedQuery.data]
  );

  const loadPendingMore = useCallback(() => {
    if (pendingQuery.hasNextPage && !pendingQuery.isFetchingNextPage) {
      void pendingQuery.fetchNextPage();
    }
  }, [
    pendingQuery.fetchNextPage,
    pendingQuery.hasNextPage,
    pendingQuery.isFetchingNextPage,
  ]);

  const loadInReviewMore = useCallback(() => {
    if (inReviewQuery.hasNextPage && !inReviewQuery.isFetchingNextPage) {
      void inReviewQuery.fetchNextPage();
    }
  }, [
    inReviewQuery.fetchNextPage,
    inReviewQuery.hasNextPage,
    inReviewQuery.isFetchingNextPage,
  ]);

  const loadRecheckMore = useCallback(() => {
    if (recheckQuery.hasNextPage && !recheckQuery.isFetchingNextPage) {
      void recheckQuery.fetchNextPage();
    }
  }, [
    recheckQuery.fetchNextPage,
    recheckQuery.hasNextPage,
    recheckQuery.isFetchingNextPage,
  ]);


  const columns: HitlKanbanColumn[] = [
    {
      bucket: 'PENDING',
      label: '검토 대기',
      items: pendingItems,
      total: pendingQuery.data?.pages[0]?.total ?? 0,
      hasMore: Boolean(pendingQuery.hasNextPage),
      isLoading: pendingQuery.isLoading,
      isFetchingNextPage: pendingQuery.isFetchingNextPage,
      onLoadMore: loadPendingMore,
    },
    {
      bucket: 'IN_REVIEW',
      label: '검토 중',
      items: inReviewItems,
      total: inReviewQuery.data?.pages[0]?.total ?? 0,
      hasMore: Boolean(inReviewQuery.hasNextPage),
      isLoading: inReviewQuery.isLoading,
      isFetchingNextPage: inReviewQuery.isFetchingNextPage,
      onLoadMore: loadInReviewMore,
    },
    {
      bucket: 'RECHECK',
      label: '재촬영 요청',
      items: recheckItems,
      total: recheckQuery.data?.pages[0]?.total ?? 0,
      hasMore: Boolean(recheckQuery.hasNextPage),
      isLoading: recheckQuery.isLoading,
      isFetchingNextPage: recheckQuery.isFetchingNextPage,
      onLoadMore: loadRecheckMore,
    },
    {
      bucket: 'COMPLETED',
      label: '처리 완료 (최근 10건)',
      items: completedItems,
      total: completedItems.length,
      hasMore: false,
      isLoading: completedQuery.isLoading,
      isFetchingNextPage: false,
      onLoadMore: () => {},
    },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">HITL 처리 현황</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiDonutCard
          label="검토 대기 건"
          centerValue={`${metricsQuery.data?.pendingCount ?? 0}건`}
          ratio={(metricsQuery.data?.pendingCount ?? 0) > 0 ? 100 : 0}
          colorClass="text-amber-500"
        />

        <KpiDonutCard
          label="오늘 검토 완료"
          centerValue={`${metricsQuery.data?.todayCompletedCount ?? 0}건`}
          ratio={
            ((metricsQuery.data?.todayCompletedCount ?? 0) /
              Math.max(
                1,
                (metricsQuery.data?.todayCompletedCount ?? 0) +
                  (metricsQuery.data?.pendingCount ?? 0)
              )) *
            100
          }
          colorClass="text-emerald-500"
        />

        <KpiDonutCard
          label="처리 지연 건"
          centerValue={`${metricsQuery.data?.overdueCount ?? 0}건`}
          ratio={
            ((metricsQuery.data?.overdueCount ?? 0) /
              Math.max(1, metricsQuery.data?.pendingCount ?? 0)) *
            100
          }
          colorClass="text-rose-500"
        />
      </div>

      <HitlKanbanPreview
        columns={columns}
        onSelect={setSelectedItem}
      />

      <HitlTicketDetailDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}