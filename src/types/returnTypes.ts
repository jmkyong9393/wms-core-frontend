/**
 * 반품/중고 서적 AI 검수 도메인 타입 시스템
 *
 * AI 멀티에이전트 파이프라인의 검수 상태(PENDING → PROCESSING → COMPLETED/HITL_WAITING)와
 * WMS 재고 라우팅 결정(RESTOCKED/REJECTED)을 프론트엔드에서 타입 안전하게 다루기 위한 정의.
 */

/** 검수 작업의 비동기 대기열 상태 */
export type InspectionJobStatus =
  | "PENDING"       // 큐 대기 중
  | "PROCESSING"    // AI Vision 분석 진행 중
  | "COMPLETED"     // 최종 판정 완료 (자동 라우팅)
  | "HITL_WAITING"; // 신뢰도 미달 → 관리자 수동 보정 대기

/** 검수 모드 (신간 반품 vs 중고 매입) */
export type InspectionMode = "NEW_RETURN" | "USED_PURCHASE";

/** 도서 상태 등급 (5단계) */
export type BookGrade = "MINT" | "EXCELLENT" | "GOOD" | "FAIR" | "SCRAP";

/** WMS 재고 라우팅 결정 */
export type WmsDecision = "RESTOCKED" | "REJECTED";

/** 결함 사유 코드 */
export interface DefectReason {
  code: string;
  description: string;
}

/** AI 검수 결과 페이로드 (서버 → 클라이언트) */
export interface InspectionResult {
  jobId: string;
  status: InspectionJobStatus;
  bookTitle: string;
  grade: BookGrade | null;
  confidenceScore: number | null;
  reasons: DefectReason[];
  wmsDecision: WmsDecision | null;
  /** 백엔드 OpenCV가 BBox를 직접 그린 표지 이미지 URL (S3) */
  processedCoverImageUrl: string;
  /** 백엔드 OpenCV가 BBox를 직접 그린 속지 이미지 URL 배열 (S3) */
  processedDefectImageUrls: string[];
  ubciScore: number | null;
  completedAt: string | null;
}

/** 검수 요청 페이로드 (클라이언트 → 서버) */
export interface ReturnInspectPayload {
  mode: InspectionMode;
  coverImageUrl: string;
  defectImageUrls: string[];
  bookTitle: string;
}

/** HITL 관리자 보정 페이로드 (클라이언트 → 서버) */
export interface HitlPayload {
  grade: BookGrade;
  reasons: DefectReason[];
  decision: WmsDecision;
}

/** HITL 보정 API 응답 */
export interface HitlOverrideResponse {
  success: boolean;
  result: InspectionResult;
}

/** Pre-signed URL 응답 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}
