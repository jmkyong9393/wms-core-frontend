import Link from 'next/link';
import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import InspectionBadges from '@/features/inspections/components/InspectionBadges';

// 대시보드에 최근 검수 기록을 간단히 표시
export default function RecentInspectionsList() {
  return (
    <div className="lg:col-span-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-5 font-mono">
      {/* 제목과 전체 검수 내역 이동 링크 */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
        <h3 className="text-sm font-black tracking-wider text-black uppercase">최근 AI 검수 기록</h3>
        <Link
          href="/admin/inspections"
          className="text-xs font-bold text-black border-b border-black hover:text-[#E60012] hover:border-[#E60012] transition-colors uppercase"
        >
          VIEW ALL →
        </Link>
      </div>
      {/* 최근 검수 기록 목록 */}
      <div className="divide-y-2 divide-black">
        {mockInspectionRecords.slice(0, 5).map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between py-3 px-2 hover:bg-black hover:text-white rounded-none transition-colors group"
          >
            {/* 도서명과 검수 번호 */}
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{record.bookTitle}</p>
              <p className="text-[10px] text-gray-400 group-hover:text-gray-300 mt-0.5">{record.id}</p>
            </div>
            
            {/* 자동 처리 여부와 최종 등급 */}
            <InspectionBadges
              isFastTrack={record.isFastTrack}
              finalGrade={record.finalGrade}
              className="shrink-0 group-hover:invert transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
