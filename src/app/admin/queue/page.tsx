'use client';

import { useAtomValue } from 'jotai';
import { hitlQueueAtom } from '@/features/queue/store/queueAtoms';
import HitlQueueCard from '@/features/queue/components/HitlQueueCard';

export default function QueuePage() {
  // 관리자 검토 목록 가져오기
  const queue = useAtomValue(hitlQueueAtom);
  // 아직 검토하지 않은 항목만 따로 분류
  const pendingItems = queue.filter((item) => item.status === 'AWAITING_REVIEW');

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* 페이지 제목과 설명 */}
      <div className="border-b-2 border-black pb-4">
        <h2 className="text-xl font-black text-black uppercase tracking-widest">AWAITING REVIEW</h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
          AI confidence score is low. Manual approval or rejection is required.
        </p>
      </div>

      {/* 검토할 항목이 없는 경우 안내 문구 표시 */}
      {pendingItems.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-8 text-center font-bold text-black">
          * NO PENDING ITEMS TO REVIEW.
        </div>
      ) : (
        /* 검토 대기 항목을 카드 형태로 표시 */
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <HitlQueueCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}