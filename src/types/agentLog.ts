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

// 4단계 등급으로 변경
export type BookGrade = 'MINT' | 'GOOD' | 'NORMAL' | 'REJECT';

export interface MockInspectionRecord {
  id: string;
  bookTitle: string;
  finalGrade: BookGrade;
  isFastTrack: boolean;
  steps: AgentLogStep[];
}