import { useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  approveHitlItemAtom,
  hitlActionErrorAtom,
  rejectHitlItemAtom,
  requestReReviewHitlItemAtom,
  restoreHitlItemAtom,
  type HitlQueueItem,
} from '@/features/queue/store/queueAtoms';
import { STATUS_LABEL } from '@/features/queue/utils/statusLabel';
import AgentConversationModal from '@/features/queue/components/AgentConversationModal';

interface SelectedTicketSummaryPanelProps {
  item: HitlQueueItem | null;
}

export default function SelectedTicketSummaryPanel({ item }: SelectedTicketSummaryPanelProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const approve = useSetAtom(approveHitlItemAtom);
  const reject = useSetAtom(rejectHitlItemAtom);
  const requestReReview = useSetAtom(requestReReviewHitlItemAtom);
  const restoreItem = useSetAtom(restoreHitlItemAtom);
  const setActionError = useSetAtom(hitlActionErrorAtom);

  // 처리 중 중복 클릭 방지 및 실패 시 이전 상태 복구
  const runAction = async (action: () => void | Promise<void>, previousItem: HitlQueueItem) => {
    if (isLoading) return;
    // 버튼 비활성화 상태 적용
    setIsLoading(true);
    try {
      // Jotai 상태 변경 및 추후 API 응답 대기
      await action();
    } catch {
      // 이전 티켓 상태 복구 및 오류 메시지 표시
      restoreItem(previousItem);
      setActionError('❌ 서버 오류로 실패했습니다. 다시 시도해 주세요.');
    } finally {
      // 버튼 비활성화 상태 해제
      setIsLoading(false);
    }
  };

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
                disabled={isLoading}
                onClick={() => runAction(() => approve(item.id), item)}
                className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ 승인 (정상)
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAction(() => reject(item.id), item)}
                className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg py-2 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕ 반려 (결함)
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAction(() => requestReReview(item.id), item)}
                className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
