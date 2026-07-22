// AI Agent 검수 파이프라인의 단계별 로그 (Mock 전용)

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

export const BOOK_GRADES = ['MINT', 'EXCELLENT', 'GOOD', 'FAIR', 'SCRAP'] as const;

export type BookGrade = (typeof BOOK_GRADES)[number];

export interface MockInspectionRecord {
  id: string;
  bookTitle: string;
  finalGrade: BookGrade;
  isFastTrack: boolean;
  inspectedAt: string;
  steps: AgentLogStep[];
}