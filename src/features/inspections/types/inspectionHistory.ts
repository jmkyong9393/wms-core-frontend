import type { AgentLogStep, BookGrade } from '@/features/inspections/types/inspection';

// 검수 이력 표에 표시할 데이터 형식
export interface InspectionHistoryRow {
  id: string;
  bookTitle: string;
  finalGrade: BookGrade;
  isFastTrack: boolean;
  inspectedAt: string;
  steps: AgentLogStep[];
}
