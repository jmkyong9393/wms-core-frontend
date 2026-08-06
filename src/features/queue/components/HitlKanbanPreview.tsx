'use client';

import { type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { useHitlQueueAction } from '@/features/queue/hooks/useHitlQueueAction';

interface HitlKanbanPreviewProps {
  queue: HitlQueueItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface TicketChipProps {
  item: HitlQueueItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

// HITL 티켓 요약 카드
function TicketChip({ item, selected, onSelect }: TicketChipProps) {
  // 대기 상태에서만 드래그 허용
  const draggable = item.status === 'AWAITING_REVIEW';

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData('text/plain', item.id);
      }}
      onClick={() => onSelect(item.id)}
      className={`w-full text-left bg-card rounded-lg border p-3 transition-colors ${
        selected ? 'border-blue-400 ring-1 ring-blue-300 dark:border-blue-600 dark:ring-blue-700' : 'border-border hover:border-muted-foreground/40'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <p className="text-sm font-semibold text-foreground truncate">{item.title ?? item.id}</p>
      <p className="text-xs text-muted-foreground truncate">{item.isbn ?? item.id}</p>
      {item.ubciScore !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">UBCI {item.ubciScore}점</p>
      )}
      {item.status === 'IN_PROGRESS' && item.reviewer && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">👤 관리자 {item.reviewer} 심사 중</p>
      )}
      {item.status === 'PROCESSING' && item.reviewer && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">👤 관리자 {item.reviewer} 처리 중</p>
      )}
    </button>
  );
}

// HITL 처리 현황 3열 보드 (대기/검토중/완료), 카드를 검토중 칸으로 드래그하면 검토 시작
export default function HitlKanbanPreview({ queue, selectedId, onSelect }: HitlKanbanPreviewProps) {
  const { startReview } = useHitlQueueAction();

  const awaiting = queue.filter((item) => item.status === 'AWAITING_REVIEW');
  // PROCESSING(판정 제출 후 서버 처리 중)도 관리자가 이미 착수한 건이라 검토중에 포함
  const inProgress = queue.filter((item) => item.status === 'IN_PROGRESS' || item.status === 'PROCESSING');
  const resolved = queue.filter((item) => item.status === 'APPROVED' || item.status === 'REJECTED');
  // RECHECK_REQUIRED(재촬영 대기)는 모바일 작업자의 후속 조치가 필요한 상태라 세 컬럼 어디에도 표시하지 않음

  const columns = [
    { key: 'todo', label: '대기', items: awaiting },
    { key: 'in_progress', label: '검토중', items: inProgress },
    { key: 'resolved', label: '완료', items: resolved },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 h-full flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-h-0">
        {columns.map((col) => (
          <div
            key={col.key}
            className="bg-muted rounded-lg p-3 flex flex-col h-full min-h-0"
            onDragOver={(e) => {
              if (col.key !== 'in_progress') return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (col.key !== 'in_progress') return;
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              if (id) startReview(id);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">{col.label}</span>
              <span className="text-xs text-muted-foreground">{col.items.length}건</span>
            </div>
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
              {col.items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">항목이 없습니다</p>
              ) : (
                col.items.map((item) => (
                  <TicketChip key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
