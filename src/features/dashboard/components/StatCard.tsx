import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string; // Legacy prop, style now overridden for brutality
}

// 대시보드의 요약 정보를 보여주는 공통 카드
export default function StatCard({ icon: Icon, label, value, unit }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-3 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-mono">
      {/* 항목별 아이콘: 둥근 모서리 없이 2D 블랙 테두리 사각형 */}
      <div className="w-10 h-10 rounded-none border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      
      {/* 항목 이름과 수치 */}
      <div className="min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{label}</p>
        <h3 className="text-lg font-black text-black">
          {value}{unit && <span className="text-xs font-bold text-gray-500 ml-0.5">{unit}</span>}
        </h3>
      </div>
    </div>
  );
}