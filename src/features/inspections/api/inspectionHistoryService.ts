import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { MockInspectionRecord } from '@/features/inspections/types/inspection';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

// 검수 이력 데이터 조회
// 현재는 임시 데이터를 사용하며, 추후 실제 API 요청으로 변경

function toInspectionHistoryRow(record: MockInspectionRecord): InspectionHistoryRow {
  return {
    id: record.id,
    bookTitle: record.bookTitle,
    finalGrade: record.finalGrade,
    isFastTrack: record.isFastTrack,
    inspectedAt: record.inspectedAt,
    steps: record.steps,
  };
}

export async function listInspectionHistory(): Promise<InspectionHistoryRow[]> {
  return mockInspectionRecords.map(toInspectionHistoryRow);
}
