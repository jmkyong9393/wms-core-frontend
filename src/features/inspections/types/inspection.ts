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

// 백엔드 검수 처리 상태
export const INSPECTION_STATUSES = [
  'PENDING',
  'PROCESSING',
  'HITL_REQUIRED',
  'APPROVED',
  'REJECTED',
  'FAILED',
] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

// 검수 이력 Mock 데이터
export interface MockInspectionRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  // 아직 등급이 정해지지 않은 경우 null
  finalGrade: BookGrade | null; 
  // 신속 검수 적용 여부
  // TODO: 백엔드 검수 방식 확정 후 수정
  isFastTrack: boolean;
  status: InspectionStatus;
  ubciScore: number | null; 
  finalReport: string | null;
  
  // 화면에 표시하는 관리자 검토 사유 코드
  // AI 판정 사유 코드와는 별도 사용
  reasonCodes?: string[];
  inspectedAt: string; // 검수 요청 시각
  updatedAt: string; // 마지막 상태 변경 시각
  steps: AgentLogStep[];
}

export interface InspectionBookDetail {
  id: string;
  title: string;
  isbn: string | null;
}

export interface InspectionAIResult {
  decision: string | null;
  reasonCode: string | null;
  defects: any[];
  revisionCount: number;
  repairDirective: string | null;
}

export interface HITLHistoryItem {
  action: string | null;
  reviewerReasonCode: string | null;
  targetGrade: string | null;
  comment: string | null;
  reviewerId: string | null;
  reviewerEmployeeId: string | null;
  reviewedAt: string | null;
  taskId: string | null;
}

export interface InspectionDetailResponse {
  id: string;
  book: InspectionBookDetail;
  status: InspectionStatus;
  mode: string;
  finalGrade: BookGrade | null;
  isFastTrack: boolean;
  ubciScore: number | null;
  finalReport: string | null;
  lpnBarcode: string | null;
  labelScanUrl: string | null; // 추가: LPN QR 스캔 대상 공개 URL
  originalImageUrls: string[];
  aiResult: InspectionAIResult;
  hitl: Record<string, any>;
  hitlHistory: HITLHistoryItem[];
  steps: AgentLogStep[];
  inspectedAt: string;
  updatedAt: string;
}