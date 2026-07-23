/**
 * 반품/중고 서적 AI 검수 API 서비스
 *
 * 실제 백엔드 API 호출과 로컬 Mock 모드 시뮬레이션을 동일 인터페이스로 제공합니다.
 * Mock 모드 활성화 시 localStorage 기반으로 상태 전이를 시뮬레이션하여
 * 백엔드 없이도 프론트엔드 단독 개발/데모가 가능합니다.
 */
import { apiClient } from "@/lib/api-client";
import type {
  ReturnInspectPayload,
  InspectionResult,
  HitlPayload,
  InspectionJobStatus,
  HitlOverrideResponse,
} from "@/types/returnTypes";

// ─── Mock 모드 제어 ───

const MOCK_MODE_KEY = "wms_mock_mode";

export const isMockMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MOCK_MODE_KEY) === "true";
};

export const setMockMode = (active: boolean): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_MODE_KEY, String(active));
  }
};

// ─── 검수 시작 요청 ───

export async function startInspection(
  payload: ReturnInspectPayload
): Promise<{ jobId: string }> {
  if (isMockMode()) {
    const mockJobId = `mock_job_${Date.now()}`;
    const mockJobData = {
      createdAt: Date.now(),
      payload,
      status: "PENDING" as InspectionJobStatus,
    };
    localStorage.setItem(`wms_job_${mockJobId}`, JSON.stringify(mockJobData));
    return { jobId: mockJobId };
  }
  const res = await apiClient.post<{ jobId: string }>(
    "/api/returns/inspect",
    payload
  );
  return res.data;
}

// ─── 검수 상태 조회 (Polling 용) ───

export async function getJobStatus(jobId: string): Promise<InspectionResult> {
  if (isMockMode()) {
    return simulateMockJobTransition(jobId);
  }
  const res = await apiClient.get<InspectionResult>(
    `/api/returns/status/${jobId}`
  );
  return res.data;
}

// ─── HITL 관리자 보정 제출 ───

export async function submitHitlOverride(
  jobId: string,
  payload: HitlPayload
): Promise<HitlOverrideResponse> {
  if (isMockMode()) {
    const updatedResult: InspectionResult = {
      jobId,
      status: "COMPLETED",
      bookTitle: "관리자 보정 도서",
      grade: payload.grade,
      confidenceScore: 1.0,
      reasons: payload.reasons,
      wmsDecision: payload.decision,
      processedCoverImageUrl: "",
      processedDefectImageUrls: [],
      ubciScore: 85,
      completedAt: new Date().toISOString(),
    };
    return { success: true, result: updatedResult };
  }
  const res = await apiClient.post<HitlOverrideResponse>(
    `/api/returns/hitl/${jobId}`,
    payload
  );
  return res.data;
}

// ─── Mock 상태 전이 시뮬레이션 ───

/**
 * Mock 모드에서 시간 경과에 따라 상태를 PENDING → PROCESSING → COMPLETED/HITL_WAITING 로 전이.
 * 생성 후 2초 미만: PENDING, 2~5초: PROCESSING, 5초 이후: 랜덤으로 COMPLETED(70%) 또는 HITL_WAITING(30%)
 */
function simulateMockJobTransition(jobId: string): InspectionResult {
  const stored = localStorage.getItem(`wms_job_${jobId}`);
  const jobData = stored ? JSON.parse(stored) : { createdAt: Date.now() };
  const elapsed = Date.now() - jobData.createdAt;

  let status: InspectionJobStatus = "PENDING";
  if (elapsed > 5000) {
    status = Math.random() > 0.3 ? "COMPLETED" : "HITL_WAITING";
  } else if (elapsed > 2000) {
    status = "PROCESSING";
  }

  const isTerminal = status === "COMPLETED" || status === "HITL_WAITING";

  return {
    jobId,
    status,
    bookTitle: jobData.payload?.bookTitle ?? "Mock 검수 도서",
    grade: isTerminal ? "NORMAL" : null,
    confidenceScore: isTerminal
      ? status === "HITL_WAITING"
        ? 0.45
        : 0.92
      : null,
    reasons: isTerminal
      ? [{ code: "STAIN_COVER", description: "표지 얼룩 오염" }]
      : [],
    wmsDecision: status === "COMPLETED" ? "RESTOCKED" : null,
    processedCoverImageUrl: isTerminal
      ? "https://placehold.co/600x800/1e293b/white?text=AI+Cover+Result"
      : "",
    processedDefectImageUrls: isTerminal
      ? [
          "https://placehold.co/300x300/1e293b/white?text=Defect+1",
          "https://placehold.co/300x300/1e293b/white?text=Defect+2",
        ]
      : [],
    ubciScore: isTerminal ? 78 : null,
    completedAt: isTerminal ? new Date().toISOString() : null,
  };
}
