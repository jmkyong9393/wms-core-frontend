'use client';

import { useSetAtom } from 'jotai';
import { approveHitlItemAtom, rejectHitlItemAtom, type HitlQueueItem } from '@/features/queue/store/queueAtoms';

interface HitlQueueCardProps {
  item: HitlQueueItem;
}

export default function HitlQueueCard({ item }: HitlQueueCardProps) {
  const approve = useSetAtom(approveHitlItemAtom);
  const reject = useSetAtom(rejectHitlItemAtom);

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 font-mono hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* 검토 대상 도서 정보 */}
      <div className="mb-3">
        <p className="text-xs font-bold text-black truncate">{item.title ?? item.id}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider truncate">{item.isbn ?? item.id}</p>
        {item.ubciScore !== undefined && (
          <p className="mt-1.5 text-[10px] font-bold text-black uppercase">UBCI {item.ubciScore} PTS</p>
        )}
      </div>
      
      {/* 현재 상태와 승인/반려 버튼 — grid로 모바일에서 확실히 세로 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto_auto] gap-2 md:justify-end">
        <span className="text-[10px] font-black border-2 border-black rounded-none px-2 py-1 bg-black text-white uppercase tracking-wider text-center">
          {item.status}
        </span>
        <button 
          onClick={() => reject(item.id)}
          className="px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all bg-white text-black font-bold text-xs cursor-pointer uppercase text-center"
        >
          REJECT
        </button>
        <button 
          onClick={() => approve(item.id)}
          className="px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-white hover:text-black transition-all bg-[#E60012] text-white font-bold text-xs cursor-pointer uppercase text-center"
        >
          APPROVE
        </button>
      </div>
    </div>
  );
}