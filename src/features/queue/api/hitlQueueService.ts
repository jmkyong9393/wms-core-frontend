import { apiClient } from '@/lib/api-client';
import type { BookGrade } from '@/features/inspections/types/inspection';
import type { HitlDecisionAction } from '@/features/queue/constants/hitlReasonCodes';



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

export type HitlQueueBucket =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'RECHECK'
  | 'COMPLETED';

export interface HitlQueueItem {
  id: string;
  bookId: string;
  bookTitle: string;
  lpnBarcode: string | null;
  locationBarcode: string | null;
  status: 'HITL_REQUIRED' | 'RECHECK_REQUIRED' | 'APPROVED' | 'REJECTED';
  ubciScore: number | null;
  finalGrade: 'MINT' | 'EXCELLENT' | 'NORMAL' | 'REJECT' | null;
  reasonCodes: string[];
  reviewerId: string | null;
  reviewerEmployeeId: string | null;
  // hitlQueueService.ts
  reviewerName: string | null;
  reviewStartedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HitlQueueListResult {
  items: HitlQueueItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasMore: boolean;
}

export interface HitlQueueMetrics {
  pendingCount: number;
  todayCompletedCount: number;
  overdueCount: number;
}

export async function listHitlQueue(
  bucket: HitlQueueBucket,
  page = 1,
  size = 10
): Promise<HitlQueueListResult> {
  const res = await apiClient.get<HitlQueueListResult>(
    '/api/v1/admin/inspections/hitl-queue',
    {
      params: { bucket, page, size },
    }
  );

  return res.data;
}

export async function getHitlQueueMetrics(): Promise<HitlQueueMetrics> {
  const res = await apiClient.get<HitlQueueMetrics>(
    '/api/v1/admin/inspections/hitl-queue/metrics'
  );

  return res.data;
}

export interface HitlReviewStartResponse {
  job_id: string;
  status: 'HITL_REQUIRED';
  reviewer_id: string;
  reviewer_employee_id: string;
  review_started_at: string;
  already_claimed_by_me: boolean;
  message: string;
}

export async function startReviewHitlItem(
  jobId: string
): Promise<HitlReviewStartResponse> {
  const res = await apiClient.post<HitlReviewStartResponse>(
    `/api/v1/inspections/${jobId}/hitl/start`
  );

  return res.data;
}
