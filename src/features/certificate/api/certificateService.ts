import { listInspectionHistory } from '@/features/inspections/api/inspectionHistoryService';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';
import type { CertificateRenderModel } from '@/features/certificate/types/certificate';

// 검수 이력 API를 통해 보증서 데이터 구성
// TODO: 확정 후 실제 보증서 조회 API로 교체
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
  const rows = await listInspectionHistory();
  const row = rows.find((r) => r.id === token);
  if (!row) return null;

  // REJECT 도서는 판매 대상이 아니므로 소비자용 보증서 미발급
  if (row.finalGrade === 'REJECT') return null;

  return toCertificateRenderModel(row);
}
