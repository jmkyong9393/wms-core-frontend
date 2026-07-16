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
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex items-center justify-between font-mono hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* 검토 대상 도서 정보 */}
      <div>
        <p className="text-xs font-bold text-black">{item.title ?? item.id}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{item.isbn ?? item.id}</p>

        {/* UBCI 점수가 있을 때만 표시 */}
        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-black uppercase">
          {item.ubciScore !== undefined && <span>UBCI {item.ubciScore} PTS</span>}
        </div> 
      </div>
      
      {/* 현재 상태와 승인/반려 버튼 */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black border-2 border-black rounded-none px-2 py-0.5 bg-black text-white uppercase tracking-wider">
          {item.status}
        </span>
        <button 
          onClick={() => reject(item.id)}
          className="px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all bg-white text-black font-bold text-xs cursor-pointer uppercase"
        >
          REJECT
        </button>
        <button 
          onClick={() => approve(item.id)}
          className="px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-white hover:text-black transition-all bg-[#E60012] text-white font-bold text-xs cursor-pointer uppercase"
        >
          APPROVE
        </button>
      </div>
    </div>
  );
}