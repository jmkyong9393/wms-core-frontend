'use client';

import { useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  approveHitlItemAtom,
  rejectHitlItemAtom,
  requestReReviewHitlItemAtom,
  startReviewHitlItemAtom,
  type HitlQueueItem,
} from '@/features/queue/store/queueAtoms';
import { STATUS_LABEL } from '@/features/queue/utils/statusLabel';
import { Button } from '@/components/ui/button';
import AgentConversationModal from './AgentConversationModal';

interface HitlQueueCardProps {
  item: HitlQueueItem;
}

const STATUS_BADGE_STYLE: Record<HitlQueueItem['status'], string> = {
  AWAITING_REVIEW: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function HitlQueueCard({ item }: HitlQueueCardProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const startReview = useSetAtom(startReviewHitlItemAtom);
  const approve = useSetAtom(approveHitlItemAtom);
  const reject = useSetAtom(rejectHitlItemAtom);
  const requestReReview = useSetAtom(requestReReviewHitlItemAtom);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
      {/* 검토 대상 도서 정보 */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{item.title ?? item.id}</p>
        <p className="text-xs text-gray-400">{item.isbn ?? item.id}</p>

        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          {item.ubciScore !== undefined && <span>UBCI {item.ubciScore}점</span>}
          {item.status === 'IN_PROGRESS' && item.reviewer && (
            <span className="text-amber-600">👤 {item.reviewer} 심사중</span>
          )}
        </div>
      </div>

      {/* 현재 상태와 액션 버튼 */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${STATUS_BADGE_STYLE[item.status]}`}>
          {STATUS_LABEL[item.status]}
        </span>

        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          className="text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          대화 로그 보기
        </button>

        {item.status === 'AWAITING_REVIEW' && (
          <Button size="sm" onClick={() => startReview(item.id)}>
            검토 시작
          </Button>
        )}

        {item.status === 'IN_PROGRESS' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => approve(item.id)}
              className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 px-2 hover:bg-green-100 transition-colors"
            >
              ✓ 승인 (정상)
            </button>
            <button
              type="button"
              onClick={() => reject(item.id)}
              className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg py-2 px-2 hover:bg-red-100 transition-colors"
            >
              ✕ 반려 (결함)
            </button>
            <button
              type="button"
              onClick={() => requestReReview(item.id)}
              className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg py-2 px-2 hover:bg-gray-100 transition-colors"
            >
              ↻ 재검토
            </button>
          </div>
        )}
      </div>

      {isLogModalOpen && (
        <AgentConversationModal item={item} onClose={() => setIsLogModalOpen(false)} />
      )}
    </div>
  );
}
