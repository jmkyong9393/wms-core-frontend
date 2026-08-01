import { mockInspectionRecords } from '@/features/inspections/mocks/mockAgentLogs';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';

// /certificate/[token]은 인증 가드가 없는 공개 라우트이므로
// ADMIN/MASTER 권한이 필요한 관리자 검수 이력 API(listInspectionHistory)에 의존하면 안 됨
// TODO: 보증서 전용 공개 조회 API가 확정되면 이 mock 조회를 교체
function toCertificateRenderModel(row: InspectionHistoryRow): CertificateRenderModel {
  return {
    token: row.id,
    bookTitle: row.bookTitle,
    grade: row.finalGrade,
    ubciScore: row.ubciScore,
    inspectedAt: row.inspectedAt,
    completedAt: row.updatedAt,
  };
}

export async function getCertificate(token: string): Promise<CertificateRenderModel | null> {
  const row = mockInspectionRecords.find((r) => r.id === token);
  if (!row) return null;

  // REJECT 도서는 판매 대상이 아니므로 소비자용 보증서 미발급
  if (row.finalGrade === 'REJECT') return null;

  return toCertificateRenderModel(row);
}
