/**
 * 반품/중고 서적 AI 검수 도메인 타입 시스템
 *
 * 백엔드 `/api/v1/inspections`, `/api/v1/inbound/used-item`, `/api/v1/books` 실제 계약을 그대로 반영한다.
 * 상태 전이: PENDING → PROCESSING → (HITL_REQUIRED | RECHECK_REQUIRED 대기 가능) → APPROVED/REJECTED/FAILED
 */
import type { BookGrade } from "@/features/inspections/types/inspection";

/** 검수 작업 상태 (백엔드 ReturnJobStatus) */
export type InspectionJobStatus =
  | "PENDING" // 큐 대기 중
  | "PROCESSING" // AI Vision 분석 진행 중
  | "HITL_REQUIRED" // 신뢰도 미달 → 관리자 판정 대기 (비종료)
  | "RECHECK_REQUIRED" // 재촬영 필요 (비종료)
  | "APPROVED" // 관리자/AI 승인 완료 (종료)
  | "REJECTED" // 반려 확정 (종료)
  | "FAILED"; // 파이프라인 처리 실패 (종료)

/** 종료 상태 목록 — 이 상태에 도달하면 SSE/폴링 연결을 정리한다 */
export const TERMINAL_JOB_STATUSES: readonly InspectionJobStatus[] = [
  "APPROVED",
  "REJECTED",
  "FAILED",
];

export function isTerminalJobStatus(status: InspectionJobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status);
}

/**
 * SSE progress 이벤트에는 없는 condition_grade/final_report 등 상세 필드가 필요한 상태.
 * 이 상태에 도달하면 GET /api/v1/inspections/{jobId}로 전체 상세를 다시 조회해야 한다.
 */
export const DETAIL_REQUIRED_STATUSES: readonly InspectionJobStatus[] = [
  "HITL_REQUIRED",
  "RECHECK_REQUIRED",
  "APPROVED",
  "REJECTED",
  "FAILED",
];

/** 검수 모드 (신간 반품 vs 중고 매입) */
export type InspectionMode = "NEW_RETURN" | "USED_PURCHASE";

/** 도서 상태 등급 — 백엔드 ConditionGrade와 값이 동일 */
export type { BookGrade };

/** AI 검수 상태/결과 조회 응답 (GET /api/v1/inspections/{job_id}) */
export interface InspectionResult {
  jobId: string;
  taskId: string | null;
  status: InspectionJobStatus;
  progress: number;
  ubciScore: number | null;
  conditionGrade: BookGrade | null;
  finalReport: string | null;
  originalImageUrls: string[];
}

/** 검수 생성/재검수 요청 응답 (POST /api/v1/inspections, POST /.../recheck) */
export interface CreateInspectionResult {
  jobId: string;
  taskId: string;
  status: InspectionJobStatus;
  message: string;
  streamTicketUrl: string;
}

/** SSE 구독 티켓 발급 응답 (POST /api/v1/inspections/{job_id}/stream-ticket) */
export interface InspectionStreamTicket {
  ticket: string;
  /** 백엔드가 이미 ticket 쿼리까지 포함해 완성한 상대 경로 (`/api/v1/inspections/{job_id}/stream?ticket=...`) */
  streamUrl: string;
  expiresIn: number;
}

/** ISBN 도서 마스터 등록/조회 응답 (POST /api/v1/books/register) */
export interface BookRegistrationResult {
  bookId: string;
  isbn: string;
  title: string;
  originalPrice: string;
  publisher: string | null;
  category: string;
  created: boolean;
}

/** 중고/반품 입고 접수 유형 (POST /api/v1/inbound/used-item의 inbound_type) */
export type UsedInboundType = "USED_PURCHASE" | "CUSTOMER_RETURN";

/** 중고/반품 입고 접수 응답 — LPN 발급 결과 포함 */
export interface UsedItemInboundResult {
  inboundId: string;
  inboundItemId: string;
  inboundType: UsedInboundType;
  status: string;
  bookId: string;
  lpnBarcode: string;
  certificateUrl: string;
  labelScanUrl: string;
  labelPrintStatus: "SENT" | "SKIPPED" | "FAILED";
  labelPrintError: string | null;
}

/** 검수 생성 요청 페이로드 (클라이언트 → 서버) */
export interface StartInspectionPayload {
  inboundItemId: string;
  bookId: string;
  mode: InspectionMode;
  imagePaths: string[];
}
