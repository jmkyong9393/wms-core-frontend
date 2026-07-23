import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { submitHitlDecision } from '@/features/queue/api/hitlQueueService';

vi.mock('@/lib/api-client', () => {
  return {
    apiClient: {
      post: vi.fn(),
    },
  };
});

describe('hitlQueueService.submitHitlDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts to /api/v1/inspections/{jobId}/hitl with snake_case body', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { job_id: 'job-1', action: 'APPROVE_NORMAL', status: 'PROCESSING', task_id: 'task-1', message: 'ok' },
    });

    const res = await submitHitlDecision('job-1', {
      action: 'APPROVE_NORMAL',
      reviewerReasonCode: 'FP_SHADOW',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/inspections/job-1/hitl', {
      action: 'APPROVE_NORMAL',
      reviewer_reason_code: 'FP_SHADOW',
    });
    expect(res).toEqual({
      jobId: 'job-1',
      action: 'APPROVE_NORMAL',
      status: 'PROCESSING',
      taskId: 'task-1',
      message: 'ok',
    });
  });

  it('includes target_grade only for APPROVE_DOWNGRADE', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { job_id: 'job-2', action: 'APPROVE_DOWNGRADE', status: 'PROCESSING', task_id: 'task-2', message: 'ok' },
    });

    await submitHitlDecision('job-2', {
      action: 'APPROVE_DOWNGRADE',
      reviewerReasonCode: 'DMG_EXT_CRUSH',
      targetGrade: 'EXCELLENT',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/inspections/job-2/hitl', {
      action: 'APPROVE_DOWNGRADE',
      reviewer_reason_code: 'DMG_EXT_CRUSH',
      target_grade: 'EXCELLENT',
    });
  });

  it('omits target_grade entirely for REJECT_RETURN even if passed by mistake', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { job_id: 'job-3', action: 'REJECT_RETURN', status: 'PROCESSING', task_id: null, message: 'ok' },
    });

    await submitHitlDecision('job-3', {
      action: 'REJECT_RETURN',
      reviewerReasonCode: 'DMG_EXT_WET',
      // 잘못 전달된 등급값 무시
      targetGrade: 'EXCELLENT',
    });

    const body = vi.mocked(apiClient.post).mock.calls[0][1];
    expect(body).not.toHaveProperty('target_grade');
  });

  it('includes comment only when provided', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { job_id: 'job-4', action: 'RE_CHECK', status: 'RECHECK_REQUIRED', task_id: null, message: 'ok' },
    });

    await submitHitlDecision('job-4', {
      action: 'RE_CHECK',
      reviewerReasonCode: 'SYS_BLURRY',
      comment: '이미지가 흐려서 재촬영 필요',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/inspections/job-4/hitl', {
      action: 'RE_CHECK',
      reviewer_reason_code: 'SYS_BLURRY',
      comment: '이미지가 흐려서 재촬영 필요',
    });
  });
});
