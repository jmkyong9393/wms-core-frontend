import AgentLogAccordion from '@/features/inspections/components/AgentLogAccordion';
import InspectionBadges from '@/features/inspections/components/InspectionBadges';
import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';

export default function InspectionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* 페이지 제목과 설명 */}
      <div className="border-b-2 border-black pb-4">
        <h2 className="text-xl font-black text-black uppercase tracking-widest">INSPECTION RECORDS</h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
          Review AI Agent inspection logs and reasoning traces at each stage.
        </p>
      </div>

      {/* 임시 검수 데이터를 하나씩 카드 형태로 표시 */}
      <div className="space-y-4">
        {mockInspectionRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-6"
          >
            {/* 책 정보와 최종 등급 표시 */}
            <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-2">
              <div>
                <p className="text-xs font-bold text-black">
                  {record.bookTitle}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{record.id}</p>
              </div>
              <InspectionBadges isFastTrack={record.isFastTrack} finalGrade={record.finalGrade} />
            </div>
            {/* AI 에이전트별 처리 과정과 판단 근거 */}
            <AgentLogAccordion record={record} />
          </div>
        ))}
      </div>
    </div>
  );
}