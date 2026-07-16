import { cn } from '@/lib/utils';
import { GRADE_BADGE_STYLE } from '@/features/inspections/utils/gradeBadge';
import type { BookGrade } from '@/features/inspections/types/inspection';

interface InspectionBadgesProps {
  isFastTrack: boolean;
  finalGrade: BookGrade;
  className?: string;
}

// 자동 처리 여부와 최종 등급을 함께 표시
export default function InspectionBadges({ isFastTrack, finalGrade, className }: InspectionBadgesProps) {
  return (
    <div className={cn('flex items-center gap-2 font-mono', className)}>
      {/* 자동 처리된 항목에만 표시 (둥근 모서리 없이 블랙 고대비) */}
      {isFastTrack && (
        <span className="text-[10px] font-black rounded-none border-2 border-black px-2 py-0.5 bg-black text-white uppercase tracking-wider">
          Fast-track
        </span>
      )}

      {/* 최종 등급에 맞는 색상 적용 */}
      <span className={`text-[10px] font-black rounded-none border-2 border-black px-2 py-0.5 ${GRADE_BADGE_STYLE[finalGrade]}`}>
        {finalGrade}
      </span>
    </div>
  );
}