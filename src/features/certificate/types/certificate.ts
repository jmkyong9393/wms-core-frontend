import type { BookGrade } from '@/features/inspections/types/inspection';

// 보증서 선행 UI용 임시 모델
// TODO: 백엔드 API 확정 후 실제 응답 구조에 맞게 교체
export interface CertificateRenderModel {
  // 목업에서는 검수 이력 id를 임시 token으로 사용
  token: string;
  bookTitle: string;

  // Policy Agent가 전달한 등급과 점수를 그대로 표시
  grade: BookGrade | null;
  ubciScore: number | null;

  // 검수 요청/완료 시각
  inspectedAt: string;
  completedAt: string;

  // API 확정 후 추가 데이터 연결 예정
  isbn?: string;
  author?: string;
  publisher?: string;

  // 고객용 품질 판정 정보
  coverImageUrl?: string;
  findings?: CertificateFinding[];
  judgementSummary?: string;
}

// 검수 사진과 해당 사진에서 확인된 상태
export interface CertificateFinding {
  photoUrl?: string;
  condition: string;
}
