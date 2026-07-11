import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  colorClass: string;
}

// 대시보드의 요약 정보를 보여주는 공통 카드
export default function StatCard({ icon: Icon, label, value, unit, colorClass }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-3">
      {/* 항목별 아이콘 */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* 항목 이름과 수치 */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <h3 className="text-xl font-bold text-gray-800">
          {value} {unit && <span className="text-xs font-normal text-gray-500">{unit}</span>}
        </h3>
      </div>
    </div>
  );
}