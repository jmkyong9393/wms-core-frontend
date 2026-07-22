import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import { getGradeLabel } from '@/features/inspections/utils/gradeBadge';
import { getStatusLabel } from '@/features/inspections/utils/statusBadge';

// 검수 이력 데이터를 CSV·Excel 내보내기 형식으로 변환
// NOTE: mockInspectionRecords 기반 프론트 전용 변환이며, 백엔드 Export API 연동 전 임시 구현이다.
export function toInspectionHistoryExportRow(row: InspectionHistoryRow): Record<string, string> {
  return {
    도서명: row.bookTitle,
    최종등급: row.finalGrade ? getGradeLabel(row.finalGrade) : '판정 전',
    검수방식: row.isFastTrack ? '신속 검수' : '표준 검수',
    상태: getStatusLabel(row.status),
    'UBCI 점수': row.ubciScore === null ? '-' : String(row.ubciScore),
    'AI 판정 사유': row.reasonCodes && row.reasonCodes.length > 0 ? row.reasonCodes.join(', ') : '-',
    '검수 요청일시': row.inspectedAt,
  };
}
