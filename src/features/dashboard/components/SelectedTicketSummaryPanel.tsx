import { useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  approveHitlItemAtom,
  rejectHitlItemAtom,
  requestReReviewHitlItemAtom,
  type HitlQueueItem,
} from '@/features/queue/store/queueAtoms';
import { STATUS_LABEL } from '@/features/queue/utils/statusLabel';
import AgentConversationModal from '@/features/queue/components/AgentConversationModal';

interface SelectedTicketSummaryPanelProps {
  item: HitlQueueItem | null;
}

// 칸반에서 클릭한 티켓의 요약 정보. 검토중 상태일 때만 승인/반려/재검토 액션 노출
export default function SelectedTicketSummaryPanel({ item }: SelectedTicketSummaryPanelProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const approve = useSetAtom(approveHitlItemAtom);
  const reject = useSetAtom(rejectHitlItemAtom);
  const requestReReview = useSetAtom(requestReReviewHitlItemAtom);

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
          {item.status === 'IN_PROGRESS' && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => approve(item.id)}
                className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 hover:bg-green-100 transition-colors"
              >
                ✓ 승인 (정상)
              </button>
              <button
                type="button"
                onClick={() => reject(item.id)}
                className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg py-2 hover:bg-red-100 transition-colors"
              >
                ✕ 반려 (결함)
              </button>
              <button
                type="button"
                onClick={() => requestReReview(item.id)}
                className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg py-2 hover:bg-gray-100 transition-colors"
              >
                ↻ 재검토
              </button>
            </div>
          )}
        </div>
      )}

      {isLogModalOpen && (
        <AgentConversationModal item={item} onClose={() => setIsLogModalOpen(false)} />
      )}
    </div>
  );
}
