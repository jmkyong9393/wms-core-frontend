'use client';

import { useAtomValue } from 'jotai';
import { hitlQueueAtom } from '@/stores/atoms';
import HitlQueueCard from '@/features/queue/components/HitlQueueCard';

export default function QueuePage() {
  // 관리자 검토 목록 가져오기
  const queue = useAtomValue(hitlQueueAtom);
  // 아직 검토하지 않은 항목만 따로 분류
  const pendingItems = queue.filter((item) => item.status === 'AWAITING_REVIEW');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 페이지 제목과 설명 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">검토 대기</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI 신뢰도가 낮아 관리자의 승인 또는 반려가 필요한 항목입니다.
        </p>
      </div>

      {/* 검토할 항목이 없는 경우 안내 문구 표시 */}
      {pendingItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          승인 대기 중인 항목이 없습니다.
        </div>
      ) : (
        /* 검토 대기 항목을 카드 형태로 표시 */
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <HitlQueueCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}