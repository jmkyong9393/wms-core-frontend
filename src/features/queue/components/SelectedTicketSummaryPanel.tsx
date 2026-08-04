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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full">
      <h3 className="text-base font-bold text-gray-800 mb-3">선택된 검수 티켓 요약</h3>
      {!item ? (
        <p className="text-xs text-gray-400 text-center py-8">대기 중인 티켓이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">도서명</p>
            <p className="text-sm font-semibold text-gray-800">{item.title ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">ISBN</p>
            <p className="text-sm text-gray-700">{item.isbn ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">상태</p>
            <p className="text-sm text-gray-700">{STATUS_LABEL[item.status]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">UBCI 점수</p>
            <p className="text-sm text-gray-700">
              {item.ubciScore !== undefined ? `${item.ubciScore}점` : '-'}
            </p>
          </div>
          {item.reviewer && (
            <div>
              <p className="text-xs text-gray-400">담당 관리자</p>
              <p className="text-sm text-gray-700">👤 {item.reviewer}</p>
            </div>
          )}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">최종 판정 요약</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {item.status === 'AWAITING_REVIEW'
                ? '검토 완료 후 표시됩니다.'
                : '등급 및 최종 판정 요약은 아직 연동되지 않았습니다.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="w-full text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg py-2 hover:bg-blue-50 transition-colors"
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
