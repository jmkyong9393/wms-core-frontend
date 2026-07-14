import Link from 'next/link';
import { mockInspectionRecords } from './shared/mockAgentLogs';
import InspectionBadges from './shared/InspectionBadges';

// 대시보드에 최근 검수 기록을 간단히 표시
export default function RecentInspectionsList() {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* 제목과 전체 검수 내역 이동 링크 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">최근 AI 검수 기록</h3>
        <Link
          href="/admin/inspections"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          전체 검수 처리 내역 보기 →
        </Link>
      </div>
      {/* 최근 검수 기록 목록 */}
      <div className="space-y-1">
        {mockInspectionRecords.slice(0, 5).map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* 도서명과 검수 번호 */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{record.bookTitle}</p>
              <p className="text-xs text-gray-400">{record.id}</p>
            </div>
            
            {/* 자동 처리 여부와 최종 등급 */}
            <InspectionBadges
              isFastTrack={record.isFastTrack}
              finalGrade={record.finalGrade}
              className="shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
