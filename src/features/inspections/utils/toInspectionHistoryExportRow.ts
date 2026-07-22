import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { getGradeLabel } from '@/features/inspections/utils/gradeBadge';

// 검수 이력 데이터를 CSV·Excel 내보내기 형식으로 변환
export function toInspectionHistoryExportRow(row: InspectionHistoryRow): Record<string, string> {
  return {
    도서명: row.bookTitle,
    최종등급: getGradeLabel(row.finalGrade),
    '검수 방식': row.isFastTrack ? '신속 검수' : '표준 검수',
    검수일시: row.inspectedAt,
  };
}
