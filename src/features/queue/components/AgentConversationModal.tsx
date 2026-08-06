'use client';

import { Suspense, useEffect } from 'react';
import { X, ImageOff } from 'lucide-react';
import type { HitlQueueItem } from '@/features/queue/api/hitlQueueService';
import { ErrorBoundary } from '@/components/error-boundary';
import AgentLogSection from '@/features/inspections/components/AgentLogSection';

export function AgentLogPanel({
  inspectionId,
}: {
  inspectionId: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pr-1">
        <ErrorBoundary
          key={inspectionId}
          fallback={
            <p className="py-8 text-center text-xs text-red-500 dark:text-red-400">
              Agent 로그를 불러오는데 실패했습니다.
            </p>
          }
        >
          <Suspense
            fallback={
              <p className="py-8 text-center text-xs text-muted-foreground">
                Agent 로그를 불러오는 중입니다.
              </p>
            }
          >
            <AgentLogSection inspectionId={inspectionId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

interface AgentConversationModalProps {
  item: HitlQueueItem | null;
  onClose: () => void;
}

// 검수 티켓 클릭 시 뜨는 Agent 단계별 실행 로그 모달
export default function AgentConversationModal({ item, onClose }: AgentConversationModalProps) {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">{item.bookTitle}</h3>
            <p className="text-xs text-muted-foreground">{item.lpnBarcode ?? item.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0">
          {/* 결함 이미지 자리 (실제 이미지 미연동, 결함 표시 목업 사각형만 표시) */}
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-border flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] bg-muted rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="w-8 h-8 mb-2" />
              <span className="text-xs">원본 이미지 준비 중</span>
              <div className="absolute left-[22%] top-[35%] w-[45%] h-[20%] border-2 border-red-400 dark:border-red-500 rounded-sm" />
            </div>
          </div>

          {/* Agent 단계별 실행 로그 */}
          <div className="p-4 flex min-h-0 flex-col">
            <AgentLogPanel inspectionId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
