/**
 * 반품/중고 도서 AI 검수 타입
 *
 * 백엔드 `/api/v1/inspections`, `/api/v1/inbound/used-item`, `/api/v1/books` 구조 반영
 * 흐름: PENDING → PROCESSING → (HITL_REQUIRED | RECHECK_REQUIRED 대기 가능) → APPROVED/REJECTED/FAILED
 */
import type { BookGrade } from "@/features/inspections/types/inspection";

/** 검수 진행 상태 */
export type InspectionJobStatus =
  | "PENDING" // 큐 대기 중
  | "PROCESSING" // AI Vision 분석 진행 중
  | "HITL_REQUIRED" // 신뢰도 미달 → 관리자 판정 대기 (비종료)
  | "RECHECK_REQUIRED" // 재촬영 필요 (비종료)
  | "APPROVED" // 관리자/AI 승인 완료 (종료)
  | "REJECTED" // 반려 확정 (종료)
  | "FAILED"; // 파이프라인 처리 실패 (종료)

/** 검수가 끝난 상태 */
export const TERMINAL_JOB_STATUSES: readonly InspectionJobStatus[] = [
  "APPROVED",
  "REJECTED",
  "FAILED",
];

export function isTerminalJobStatus(status: InspectionJobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status);
}

/**
 * 상세 결과 재조회가 필요한 상태
 *
 * SSE에 없는 등급과 최종 결과를 조회하기 위해
 * 검수 상세 API를 다시 호출
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
  /** 티켓이 포함된 SSE 연결 주소 */
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

/** 검수 생성 요청 데이터 */
export interface StartInspectionPayload {
  inboundItemId: string;
  bookId: string;
  mode: InspectionMode;
  imagePaths: string[];
}
