// AI 검수 단계별 로그 타입

export type AgentName = 'Vision' | 'Policy' | 'Critic' | 'Report';

export type StepExecutionStatus = 'COMPLETED' | 'SKIPPED';

export interface AgentLogStep {
  stepOrder: number;
  agentName: AgentName;
  executionStatus: StepExecutionStatus;
  resultSummary: string;
  reasoning?: string;
  reasonCode?: string;
}

export const BOOK_GRADES = ['MINT', 'EXCELLENT', 'NORMAL', 'REJECT'] as const;

export type BookGrade = (typeof BOOK_GRADES)[number];

// 백엔드 ReturnJob의 검수 처리 상태 (inspection_backend_status_summary.md 기준)
export const INSPECTION_STATUSES = [
  'PENDING',
  'PROCESSING',
  'HITL_REQUIRED',
  'APPROVED',
  'REJECTED',
  'FAILED',
] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export interface MockInspectionRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  finalGrade: BookGrade | null; // 미판정 시 null
  // Policy/Critic 단계 생략 여부
  // TODO: 백엔드 검수 방식 기준 확정 후 수정
  isFastTrack: boolean;
  status: InspectionStatus;
  ubciScore: number | null; 
  finalReport: string | null;
  
  // AI 판정 사유 코드
  // 관리자 HITL 사유 코드와 별도 관리
  // TODO: 백엔드 응답 형식 확정 후 수정
  reasonCodes?: string[];
  inspectedAt: string; // 검수 요청 시각
  updatedAt: string; // 마지막 상태 변경 시각
  steps: AgentLogStep[];
}