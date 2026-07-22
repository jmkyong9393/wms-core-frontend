import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { MockInspectionRecord } from '@/features/inspections/types/inspection';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

// mock 검수 데이터를 이력 Grid 형식으로 변환 
// TODO: 백엔드 검수 이력 조회 API 연동 후 교체
function toInspectionHistoryRow(record: MockInspectionRecord): InspectionHistoryRow {
  return {
    id: record.id,
    bookId: record.bookId,
    bookTitle: record.bookTitle,
    finalGrade: record.finalGrade,
    isFastTrack: record.isFastTrack,
    status: record.status,
    ubciScore: record.ubciScore,
    finalReport: record.finalReport,
    reasonCodes: record.reasonCodes,
    inspectedAt: record.inspectedAt,
    updatedAt: record.updatedAt,
    steps: record.steps,
  };
}

export async function listInspectionHistory(): Promise<InspectionHistoryRow[]> {
  return mockInspectionRecords.map(toInspectionHistoryRow);
}
