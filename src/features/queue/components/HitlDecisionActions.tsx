'use client';

import { useState } from 'react';
import { type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { useHitlQueueAction } from '@/features/queue/hooks/useHitlQueueAction';
import HitlDecisionDialog, { type HitlDecisionMode } from './HitlDecisionDialog';

interface HitlDecisionActionsProps {
  item: HitlQueueItem;
}

// 관리자 판정 버튼과 사유 입력창
export default function HitlDecisionActions({ item }: HitlDecisionActionsProps) {
  const { runDecision, isLoading } = useHitlQueueAction();
  // 현재 열린 판정 유형
  const [openMode, setOpenMode] = useState<HitlDecisionMode | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setOpenMode('approve')}
          className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 px-2 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-green-400 dark:bg-green-950/40 dark:border-green-900 dark:hover:bg-green-900/40"
        >
          ✓ 승인 (정상)
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setOpenMode('reject')}
          className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg py-2 px-2 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:bg-red-950/40 dark:border-red-900 dark:hover:bg-red-900/40"
        >
          ✕ 반려 (결함)
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setOpenMode('recheck')}
          className="text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-lg py-2 px-2 hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↻ 재검토
        </button>
      </div>

      {/* 선택한 판정의 사유 입력창 */}
      {openMode && (
        <HitlDecisionDialog
          item={item}
          mode={openMode}
          onClose={() => setOpenMode(null)}
          onSubmit={(payload) => runDecision(item.id, payload)}
        />
      )}
    </>
  );
}
