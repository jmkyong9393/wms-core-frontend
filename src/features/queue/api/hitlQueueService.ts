import { apiClient } from '@/lib/api-client';
import type { BookGrade } from '@/features/inspections/types/inspection';
import type { HitlDecisionAction } from '@/features/queue/constants/hitlReasonCodes';

// 검토 시작 mock 지연 시간
const MOCK_DELAY_MS = 400;
const mockDelay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

export interface HitlDecisionPayload {
  action: HitlDecisionAction;
  reviewerReasonCode: string;

  // 하향 승인 시에만 사용
  targetGrade?: Extract<BookGrade, 'EXCELLENT' | 'NORMAL'>;
  comment?: string;
}

export interface HitlDecisionResponse {
  jobId: string;
  action: HitlDecisionAction;
  status: 'PROCESSING' | 'RECHECK_REQUIRED';
  taskId: string | null;
  message: string;
}

// 백엔드 응답 형식
interface HitlDecisionApiResponse {
  job_id: string;
  action: HitlDecisionAction;
  status: 'PROCESSING' | 'RECHECK_REQUIRED';
  task_id: string | null;
  message: string;
}

// 관리자 최종 판정 제출
export async function submitHitlDecision(
  jobId: string,
  payload: HitlDecisionPayload
): Promise<HitlDecisionResponse> {
  const body = {
    action: payload.action,
    reviewer_reason_code: payload.reviewerReasonCode,
    ...(payload.action === 'APPROVE_DOWNGRADE' ? { target_grade: payload.targetGrade } : {}),
    ...(payload.comment ? { comment: payload.comment } : {}),
  };

  const res = await apiClient.post<HitlDecisionApiResponse>(
    `/api/v1/inspections/${jobId}/hitl`,
    body
  );

  return {
    jobId: res.data.job_id,
    action: res.data.action,
    status: res.data.status,
    taskId: res.data.task_id,
    message: res.data.message,
  };
}

// 대기 티켓을 검토중 상태로 변경
// TODO: 검토 시작 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function startReviewHitlItem(id: string): Promise<void> {
  await mockDelay();
}
