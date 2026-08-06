'use client';

import {
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  getHitlQueueMetrics,
  listHitlQueue,
  type HitlQueueBucket,
} from '@/features/queue/api/hitlQueueService';

export const HITL_QUEUE_PAGE_SIZE = 10;

export const hitlQueueQueryKey = (
  bucket: HitlQueueBucket
) => ['hitlQueue', bucket] as const;

export function useHitlQueueInfiniteQuery(
  bucket: HitlQueueBucket
) {
  return useInfiniteQuery({
    queryKey: hitlQueueQueryKey(bucket),
    queryFn: ({ pageParam }) =>
      listHitlQueue(
        bucket,
        pageParam,
        HITL_QUEUE_PAGE_SIZE
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.page + 1
        : undefined,
  });
}

export function useHitlQueueMetricsQuery() {
  return useQuery({
    queryKey: ['hitlQueueMetrics'],
    queryFn: getHitlQueueMetrics,
  });
}