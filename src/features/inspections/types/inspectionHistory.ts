import type { AgentLogStep, BookGrade, InspectionStatus } from '@/features/inspections/types/inspection';

// 검수 이력 조회 API 요청 파라미터
// 쿼리 파라미터명은 API 문서 기준 snake_case
export interface InspectionHistoryListParams {
  status?: InspectionStatus;
  start_date?: string;
  end_date?: string;
  keyword?: string;
  grade?: BookGrade;
  page: number;
  size: number;
}

// 검수 이력 표에 표시할 데이터 형식
export interface InspectionHistoryRow {
  id: string;
  bookId: string;
  bookTitle: string;
  coverImageUrl?: string | null;
  finalGrade: BookGrade | null;
  isFastTrack: boolean;
  status: InspectionStatus;
  ubciScore: number | null;
  finalReport: string | null;
  reasonCodes?: string[];
  inspectedAt: string;
  updatedAt: string;
  steps: AgentLogStep[];
}
