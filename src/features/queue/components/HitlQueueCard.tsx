'use client';

import { useSetAtom } from 'jotai';
import { approveHitlItemAtom, rejectHitlItemAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';
import { Button } from '@/components/ui/button';

interface HitlQueueCardProps {
  item: HitlQueueItem;
}

export default function HitlQueueCard({ item }: HitlQueueCardProps) {
  const approve = useSetAtom(approveHitlItemAtom);
  const reject = useSetAtom(rejectHitlItemAtom);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      {/* 검토 대상 도서 정보 */}
      <div>
        <p className="text-sm font-semibold text-gray-800">{item.title ?? item.id}</p>
        <p className="text-xs text-gray-400">{item.isbn ?? item.id}</p>

        {/* UBCI 점수가 있을 때만 표시 */}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          {item.ubciScore !== undefined && <span>UBCI {item.ubciScore}점</span>}
        </div> 
      </div>
      
      {/* 현재 상태와 승인/반려 버튼 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-yellow-100 text-yellow-700">
          {item.status}
        </span>
        <Button size="sm" variant="outline" onClick={() => reject(item.id)}>
          반려
        </Button>
        <Button size="sm" onClick={() => approve(item.id)}>
          승인
        </Button>
      </div>
    </div>
  );
}