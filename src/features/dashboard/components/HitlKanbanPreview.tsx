'use client';

import Link from 'next/link';
import { useSetAtom } from 'jotai';
import { startReviewHitlItemAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';

const PREVIEW_LIMIT = 3;

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

function TicketChip({ item, selected, onSelect }: TicketChipProps) {
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
      className={`w-full text-left bg-white rounded-lg border p-3 transition-colors ${
        selected ? 'border-blue-400 ring-1 ring-blue-300' : 'border-gray-100 hover:border-gray-300'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <p className="text-sm font-semibold text-gray-800 truncate">{item.title ?? item.id}</p>
      <p className="text-xs text-gray-400 truncate">{item.isbn ?? item.id}</p>
      {item.ubciScore !== undefined && (
        <p className="text-xs text-gray-500 mt-1">UBCI {item.ubciScore}점</p>
      )}
      {item.status === 'IN_PROGRESS' && item.reviewer && (
        <p className="text-xs text-amber-600 mt-1">👤 {item.reviewer} 심사중</p>
      )}
    </button>
  );
}

// 관리자 대시보드용 HITL 처리 현황 3열 미리보기 (승인/반려는 /admin/queue에서 처리, 대기→검토중 전이만 드래그로 가능)
export default function HitlKanbanPreview({ queue, selectedId, onSelect }: HitlKanbanPreviewProps) {
  const startReview = useSetAtom(startReviewHitlItemAtom);

  const awaiting = queue.filter((item) => item.status === 'AWAITING_REVIEW');
  const inProgress = queue.filter((item) => item.status === 'IN_PROGRESS');
  const resolved = queue.filter((item) => item.status === 'APPROVED' || item.status === 'REJECTED');

  const columns = [
    { key: 'todo', label: '대기', items: awaiting },
    { key: 'in_progress', label: '검토중', items: inProgress },
    { key: 'resolved', label: '완료', items: resolved },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">HITL 처리 현황</h3>
        <Link href="/admin/queue" className="text-sm font-medium text-blue-600 hover:underline">
          전체 보기 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {columns.map((col) => (
          <div
            key={col.key}
            className="bg-gray-50 rounded-lg p-3"
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
              <span className="text-xs font-semibold text-gray-600">{col.label}</span>
              <span className="text-xs text-gray-400">{col.items.length}건</span>
            </div>
            <div className="space-y-2 min-h-80">
              {col.items.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">항목이 없습니다</p>
              ) : (
                col.items
                  .slice(0, PREVIEW_LIMIT)
                  .map((item) => (
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
