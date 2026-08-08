'use client';

import {
  useEffect,
  useRef,
} from 'react';
import { User } from 'lucide-react';
import type {
  HitlQueueBucket,
  HitlQueueItem,
} from '@/features/queue/api/hitlQueueService';
import { useHitlQueueAction } from '@/features/queue/hooks/useHitlQueueAction';
import { getHitlReasonLabel } from '@/features/queue/constants/hitlReasonCodes';

export interface HitlKanbanColumn {
  bucket: HitlQueueBucket;
  label: string;
  items: HitlQueueItem[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

interface HitlKanbanPreviewProps {
  columns: HitlKanbanColumn[];
  onSelect: (item: HitlQueueItem) => void;
}

interface BoardColumnProps {
  column: HitlKanbanColumn;
  onSelect: (item: HitlQueueItem) => void;
}

function maskName(name: string) {
  const chars = Array.from(name);

  if (chars.length <= 1) return name;
  if (chars.length === 2) return `${chars[0]}*`;

  return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars.at(-1)}`;
}

function TicketCard({
  item,
  draggable,
  onSelect,
}: {
  item: HitlQueueItem;
  draggable: boolean;
  onSelect: (item: HitlQueueItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) return;
        event.dataTransfer.setData('text/plain', item.id);
      }}
      className="w-full rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-md"
    >
      <p className="truncate text-sm font-semibold text-foreground">
        {item.bookTitle}
      </p>

      <p className="mt-1 truncate text-xs text-muted-foreground">
        {item.lpnBarcode ?? 'LPN 미발급'}
      </p>

      {item.locationBarcode && (
        <p className="mt-1 text-xs text-muted-foreground">
          위치 {item.locationBarcode}
        </p>
      )}

      {item.ubciScore !== null && (
        <p className="mt-1 text-xs text-muted-foreground">
          UBCI {item.ubciScore}점
        </p>
      )}

      {item.status === 'HITL_REQUIRED' && item.reviewerName && (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <User className="size-3" aria-hidden />
          관리자 {maskName(item.reviewerName)}님 심사 중
        </p>
      )}

      {item.reasonCodes.length > 0 && (
        <p className="mt-1 truncate text-xs text-red-500">
          {item.reasonCodes.map(getHitlReasonLabel).join(', ')}
        </p>
      )}
    </button>
  );
}

function BoardColumn({
  column,
  onSelect,
}: BoardColumnProps) {
  const { startReview } = useHitlQueueAction();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const canStartReview =
    column.bucket === 'PENDING';

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = sentinelRef.current;

    if (
      !root ||
      !target ||
      !column.hasMore ||
      column.isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          column.onLoadMore();
        }
      },
      {
        root,
        rootMargin: '120px',
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [
    column.hasMore,
    column.isFetchingNextPage,
    column.onLoadMore,
  ]);

  return (
    <section
      className="flex min-h-0 flex-col rounded-xl bg-muted p-3"
      onDragOver={(event) => {
        if (column.bucket !== 'IN_REVIEW') return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (column.bucket !== 'IN_REVIEW') return;

        event.preventDefault();

        const jobId = event.dataTransfer.getData(
          'text/plain'
        );

        if (jobId) {
          startReview(jobId);
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          {column.label}
        </h3>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {column.total}건
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
      >
        {column.isLoading ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            불러오는 중입니다.
          </p>
        ) : column.items.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            항목이 없습니다.
          </p>
        ) : (
          column.items.map((item) => (
            <TicketCard
              key={item.id}
              item={item}
              draggable={canStartReview}
              onSelect={onSelect}
            />
          ))
        )}

        <div
          ref={sentinelRef}
          className="h-1"
        />

        {column.isFetchingNextPage && (
          <p className="py-2 text-center text-xs text-muted-foreground">
            더 불러오는 중입니다.
          </p>
        )}

        {column.bucket !== 'COMPLETED' &&
          !column.hasMore &&
          column.items.length > 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              모든 항목을 불러왔습니다.
            </p>
          )}
      </div>
    </section>
  );
}

export default function HitlKanbanPreview({
  columns,
  onSelect,
}: HitlKanbanPreviewProps) {
  return (
    <div className="overflow-x-auto">
      <div className="grid h-[580px] min-w-[1180px] grid-cols-4 gap-3">
        {columns.map((column) => (
          <BoardColumn
            key={column.bucket}
            column={column}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}