import type { AgentLogStep, BookGrade, InspectionStatus } from '@/features/inspections/types/inspection';

// 검수 이력 표에 표시할 데이터 형식
export interface InspectionHistoryRow {
  id: string;
  bookId: string;
  bookTitle: string;
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
