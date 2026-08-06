'use client';

import { useState } from 'react';
import { type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { STATUS_LABEL } from '@/features/queue/utils/statusLabel';
import AgentConversationModal from '@/features/queue/components/AgentConversationModal';
import HitlDecisionActions from '@/features/queue/components/HitlDecisionActions';

interface SelectedTicketSummaryPanelProps {
  item: HitlQueueItem | null;
}

export default function SelectedTicketSummaryPanel({ item }: SelectedTicketSummaryPanelProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 h-full">
      <h3 className="text-base font-bold text-foreground mb-3">선택된 검수 티켓 요약</h3>
      {!item ? (
        <p className="text-xs text-muted-foreground text-center py-8">대기 중인 티켓이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">도서명</p>
            <p className="text-sm font-semibold text-foreground">{item.title ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ISBN</p>
            <p className="text-sm text-foreground">{item.isbn ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">상태</p>
            <p className="text-sm text-foreground">{STATUS_LABEL[item.status]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">UBCI 점수</p>
            <p className="text-sm text-foreground">
              {item.ubciScore !== undefined ? `${item.ubciScore}점` : '-'}
            </p>
          </div>
          {item.reviewer && (
            <div>
              <p className="text-xs text-muted-foreground">담당 관리자</p>
              <p className="text-sm text-foreground">👤 {item.reviewer}</p>
            </div>
          )}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">최종 판정 요약</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.status === 'AWAITING_REVIEW'
                ? '검토 완료 후 표시됩니다.'
                : '등급 및 최종 판정 요약은 아직 연동되지 않았습니다.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          >
            대화 로그 보기
          </button>
          {item.status === 'IN_PROGRESS' && <HitlDecisionActions item={item} />}
        </div>
      )}

      {isLogModalOpen && (
        <AgentConversationModal item={item} onClose={() => setIsLogModalOpen(false)} />
      )}
    </div>
  );
}
