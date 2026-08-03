import type { BookGrade } from '@/features/inspections/types/inspection';

// GET /api/v1/certificate/{token} 응답 기반 소비자용 보증서 모델
export interface CertificateRenderModel {
  bookTitle: string;
  isbn: string | null;
  publisher: string | null;

  // 검수 완료 후 확정된 등급/점수 (해당 API는 검수 미완료 시 404를 반환하므로 항상 값이 채워져 있음)
  grade: BookGrade;
  ubciScore: number;

  // 소비자에게 공개할 품질 검수 결과 요약
  reportSummary: string;

  // 현재 보증서 결과가 확정된 검수 시각
  inspectedAt: string;
}
