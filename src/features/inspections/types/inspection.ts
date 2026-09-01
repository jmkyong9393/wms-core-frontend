// AI 검수 단계별 로그 타입

// 백엔드 extract_agent_steps가 내보내는 전체 에이전트 이름과 동기화
export type AgentName =
  | 'Supervisor'
  | 'Vision'
  | 'Policy'
  | 'Critic'
  | 'AutoRefund'
  | 'Report'
  | 'Human';

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

// 백엔드 검수 처리 상태 (ReturnJobStatus 7종과 동일 — types/returnTypes.ts와 정합 유지)
export const INSPECTION_STATUSES = [
  'PENDING',
  'PROCESSING',
  'HITL_REQUIRED',
  'RECHECK_REQUIRED',
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
  coverImageUrl?: string | null;
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

export interface VisionDetection {
  imageIndex: number;
  imageView: 'FRONT' | 'BACK' | 'INSIDE';
  imageUrl: string;
  type: string;
  defectType: string;
  ratio: number | null;
  confidence: number;
  yoloConfidence: number | null;
  bbox: [number, number, number, number];
  coordinateSpace: 'ORIGINAL_IMAGE_NORMALIZED';
}

// 신규 BBOX 레이어 공통 필드 (YOLO 후보 / 확정 결함)
// imageView는 'INNER'를 사용한다 - 레거시 VisionDetection의 'INSIDE'와 다른 값이므로 통합하지 않는다.
export interface DefectBboxBase {
  candidateId: string;
  imageIndex: number;
  imageView: 'FRONT' | 'BACK' | 'INNER';
  imageUrl: string;
  defectType: string;
  confidence: number;
  bbox: [number, number, number, number];
  coordinateSpace: 'ORIGINAL_IMAGE_NORMALIZED';
}

// YOLO가 제안한 전체 결함 후보 (CONFIRMED/REJECTED/UNCERTAIN 모두 포함, 화면 참고용)
export interface YoloDefectCandidate extends DefectBboxBase {
  sourceModel: string;
  reviewDecision: 'CONFIRMED' | 'REJECTED' | 'UNCERTAIN';
  rejectReason: string | null;
}

// Vision Agent가 최종 확정한 결함 (UBCI·품질보증서 계산에 사용되는 데이터)
export type ConfirmedDefect = DefectBboxBase;

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
  visionDetections: VisionDetection[]; // 레거시 호환용, 신규 화면은 confirmedDefects 사용
  yoloCandidates: YoloDefectCandidate[];
  confirmedDefects: ConfirmedDefect[];
  aiResult: InspectionAIResult;
  hitl: Record<string, any>;
  hitlHistory: HITLHistoryItem[];
  steps: AgentLogStep[];
  inspectedAt: string;
  updatedAt: string;
}